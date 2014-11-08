// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a Apache
// license that can be found in the LICENSE file.

var Settings = require('./settings');
var Mousetrap = require('mousetrap');

class Log {
  constructor() {
    Mousetrap.bind(['command+shift+l', 'ctrl+shift+l'], () => this.onOff())
  }

  info(message) {this.log('info', message)}
  warn(message) {this.log('warn', message)}
  debug(message) {this.log('debug', message)}
  good(message) {this.log('good', message)}
  bad(message) {this.log('bad', message)}

  onOff() {
    Settings.logging = !Settings.logging
    if (Settings.logging) console.log('%c [WARNING] log enabled', 'color: red')
    else console.log('%c [WARNING] log disabled', 'color: red')
  }

  log(level, message) {
    if (!Settings.logging) return
    var color, prefix
    if (level === 'warn') { [color, prefix] = ['red', 'WARN'] }
    if (level === 'info') { [color, prefix] = ['green', 'INFO'] }
    if (level === 'debug') { [color, prefix] = ['blue', 'DEBUG'] }
    if (level === 'good') { [color, prefix] = ['green', 'GOOD'] }
    if (level === 'bad') { [color, prefix] = ['red', 'GOOD'] }
    console.log('%c [' + prefix + '] ' + message, 'color:' + color)
  }
}

Log.getInstance = function() {
  if (this._instance === undefined) {
    this._instance = new this()
  }
  return this._instance
}


module.exports = Log
