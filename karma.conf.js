// Karma configuration
// Generated on Sat Oct 25 2014 17:11:56 GMT-0200 (BRST)

var dotenv = require('dotenv');
var exec = require('child_process').exec;
exec('node bin/hook.js');
dotenv.load();

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['browserify', 'traceur', 'mocha', 'sinon-chai', 'jquery-2.1.0'],


    // list of files / patterns to load in the browser
    files: [
      'node_modules/underscore/underscore-min.js',
      'node_modules/clappr/dist/clappr.js',
      'test/**/*spec.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      './index.js': ['traceur'],
      'src/**/*.js': ['traceur'],
      'test/**/*.js': ['traceur', 'browserify']
    },

    traceurPreprocessor: {
      options: {
        sourceMap: true
      }
    },

    browserify: {
      debug: true,
      transform: ['es6ify'],
      prebundle: function(bundle) {
        bundle.external('base_object');
        bundle.external('underscore');
      },
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
