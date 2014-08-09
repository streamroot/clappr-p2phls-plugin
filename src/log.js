// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a Apache
// license that can be found in the LICENSE file.

var Settings = require("./settings")
var Logger = require('log-with-style')

class Log {}

Log.info = function(message) {Log.log('info', message)}
Log.warn = function(message) {Log.log('warn', message)}
Log.debug = function(message) {Log.log('debug', message)}

Log.log = function(level, message) {
  if (!Settings.logging) return
  if (level === 'warn') {
    Logger('[c="color: red"][WARNING][c] ' + message)
  } else if (level === 'info') {
    Logger('[c="color: green"][INFO] [c] ' + message)
  } else if (level === 'debug') {
    Logger('[c="color: blue"][DEBUG] [c] ' + message)
  }
}

module.exports = Log
