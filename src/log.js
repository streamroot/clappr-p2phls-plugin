// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a Apache
// license that can be found in the LICENSE file.

var Settings = require('./settings');
var Logger = require('log-with-style');
var Mousetrap = require('mousetrap');

class Log {}

Log.info = function(message) {Log.log('info', message)}
Log.warn = function(message) {Log.log('warn', message)}
Log.debug = function(message) {Log.log('debug', message)}

Log.active = Settings.logging

Log.onOff = function() {
  Log.active = !Log.active
  if (Log.active) Logger('[c="color: red"][WARNING][c] log enabled')
  else Logger('[c="color: red"][WARNING][c] log disabled')
}

Log.log = function(level, message) {
  if (!Log.active) return
  if (level === 'warn') {
    Logger('[c="color: red"][WARNING][c] ' + message)
  } else if (level === 'info') {
    Logger('[c="color: green"][INFO] [c] ' + message)
  } else if (level === 'debug') {
    Logger('[c="color: blue"][DEBUG] [c] ' + message)
  }
}

Mousetrap.bind(['command+shift+l', 'ctrl+shift+l'], () => Log.onOff())

module.exports = Log
