// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a Apache
// license that can be found in the LICENSE file.

var Settings = require("./settings")
var _ = require("underscore")
var log = require('./log');

class Storage {
  constructor() {
    this.keys = []
    this.chunks = {}
  }

  setItem(key, value) {
    key = this.normalizeKey(key)
    if (_.has(this.chunks, key)) {
      log.warn("already have this chunk on storage: " + key)
      return
    }
    this.keys.push(key)
    this.chunks[key] = value
    if (this.keys.length > Settings.maxStorageChunks) {
      this.removeOlderItem()
    }
  }

  removeOlderItem() {
    var key = this.keys.splice(0, 1)[0]
    delete this.chunks[key]
  }

  getItem(key) {
    key = this.normalizeKey(key)
    return this.chunks[key];
  }

  contain(key) {
    key = this.normalizeKey(key)
    return _.contains(this.keys, key)
  }

  normalizeKey(key) {
    return key.match('.*/(.*/.*.ts)')[1]
  }
}

Storage.getInstance = function() {
  if (this._instance === undefined) {
    this._instance = new this();
  }
  return this._instance;
}

module.exports = Storage

