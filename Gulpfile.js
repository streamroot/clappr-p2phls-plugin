var gulp = require('gulp');
var sass = require('gulp-sass');
var minifyCSS = require('gulp-minify-css');
var es6ify = require('es6ify');
var rename = require('gulp-rename');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify')
var source = require('vinyl-source-stream');
var exec = require('child_process').exec;
var args = require('yargs').argv;
var express = require('express');
var util = require('gulp-util');
var livereload = require('gulp-livereload');
var s3 = require('s3');
var fs = require('fs');

var files = {
  css:  'public/*.css',
  scss: 'public/*.scss',
  html: 'public/*.html'
};

gulp.task('pre-build', ['sass', 'copy-html', 'copy-css'], function(done) {
  exec('node bin/hook.js', done);
});

gulp.task('build', ['pre-build'], function(b) {
  var isProd = ['prod', 'production'].indexOf(args.env) !== -1 ? true : false;

  var stream = browserify()
    .transform(es6ify.configure(/^(?!.*node_modules)+.+\.js$/))
    .add(es6ify.runtime)
    .add('./index.js', {entry: true})
    .external('base_object')
    .external('playback')
    .external('browser')
    .external('zepto')
    .external('underscore')
    .external('hls')
    .bundle()
    .pipe(source('main.js'))
    .pipe(rename( 'p2phls' + (isProd ? '.min.js' : '.js')));

  if(isProd) {
    stream.pipe(streamify(uglify()));
  }
  stream.pipe(gulp.dest('./dist'))
});

gulp.task('sass', function () {
    return gulp.src(files.scss)
        .pipe(sass())
        .pipe(minifyCSS())
        .pipe(gulp.dest("build"));
});

gulp.task("copy-css", function() {
  return gulp.src(files.css)
    .pipe(minifyCSS())
    .pipe(gulp.dest('build'));
});

gulp.task("copy-html", function() {
  return gulp.src(files.html)
    .pipe(gulp.dest('build'));
});

gulp.task('serve', ['watch'], function() {
  express()
    .use(express.static('.'))
    .use(express.static('./dist'))
    .listen(3000, "0.0.0.0");
  util.log(util.colors.bgGreen('Listening on port 3000'));
});


gulp.task('watch', function() {
  var reloadServer = livereload();

  var js = gulp.watch('./*.js');
  js.on('change', function(event) {
    gulp.start('build', function() {
      reloadServer.changed(event.path);
    });
  });

  var assets = gulp.watch('./public/*.{html,scss,css}');
  assets.on('change', function(event) {
    gulp.start(['sass', 'copy-html', 'copy-css'], function() {
      reloadServer.changed(event.path);
    });
  });
  util.log(util.colors.bgGreen('Watching for changes...'));
});


gulp.task('upload', function(b) {
  var awsOptions = JSON.parse(fs.readFileSync('./aws.json'));
  var client = s3.createClient({s3Options: awsOptions});
  var params = {localDir: "./dist/", deleteRemoved: true, s3Params: {Bucket: "cdn.clappr.io", Prefix: "bemtv/latest/"}};
  var uploader = client.uploadDir(params);
  uploader.on('error', function(err) { console.error("unable to sync:", err.stack); });
  uploader.on('end', function() { console.log("done uploading"); });
  return;
});

