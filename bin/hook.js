// Copyright 2014 Globo.com Clappr authors. All rights reserved.
// Use of this source code is governed by a Apache
// license that can be found in the LICENSE file.

var glob = require('glob').sync;
var mkdirp = require('mkdirp').sync;
var path = require('path');
var fs = require('fs');
var _ = require('underscore');

var codeTemplate = _.template(fs.readFileSync('bin/.hook_template').toString());

var jstFile = './src/jst.js';

function format(filePath) {
  var content = fs.readFileSync(filePath).toString().replace(/\r?\n|\r/g, '');
  return {name: 'p2phls', content: content};
}

function copyFiles(asset) {
  var targetDir = path.extname(asset) === '.js' ? 'dist/' : 'dist/assets';
  fs.createReadStream(asset)
    .pipe(fs.createWriteStream(path.join(targetDir, path.basename(asset))));
}

var templates = glob('build/**/*.html').map(format);
var styles = glob('build/**/*.css').map(format);

fs.writeFileSync(jstFile, codeTemplate({templates: templates, styles: styles}));

mkdirp('dist/assets/');

glob('./node_modules/clappr/dist/**/*.{png,jpeg,jpg,gif,swf,eot,ttf,svg}').map(copyFiles);
glob('public/*.{png,jpeg,jpg,gif,swf,eot,ttf,svg,js}').map(copyFiles);
glob('./node_modules/clappr/dist/*.js').map(copyFiles);
