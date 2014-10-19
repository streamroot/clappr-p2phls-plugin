// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a Apache
// license that can be found in the LICENSE file.

var Settings = require('./settings');
var Logger = require('log-with-style');
var Mousetrap = require('mousetrap');

class Log {
  constructor() {
    Mousetrap.bind(['command+shift+l', 'ctrl+shift+l'], () => this.onOff())
  }

  info(message) {this.log('info', message)}
  warn(message) {this.log('warn', message)}
  debug(message) {this.log('debug', message)}

  onOff() {
    Settings.logging = !Settings.logging
    if (Settings.logging) Logger('[c="color: red"][WARNING][c] log enabled')
    else Logger('[c="color: red"][WARNING][c] log disabled')
  }

  log(level, message) {
    if (!Settings.logging) return
    if (level === 'warn') { Logger('[c="color: red"][WARNING][c] ' + message) }
    else if (level === 'info') { Logger('[c="color: green"][INFO] [c] ' + message) }
    else if (level === 'debug') { Logger('[c="color: blue"][DEBUG] [c] ' + message) }
  }
}

Log.getInstance = function() {
  if (this._instance === undefined) {
    this._instance = new this()
  }
  return this._instance
}


module.exports = Log
