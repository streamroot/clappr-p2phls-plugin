// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

var Settings = require("./settings")
var _ = require("underscore")

class Storage {
  constructor() {
    this.keys = []
    this.chunks = {}
    this.totalBytes = 0
  }

  setItem(key, value) {
    this.keys.push(key)
    this.chunks[key] = value
    this.totalBytes += value.length
    if (this.totalBytes > Settings.maxStorageBytes) {
      this.removeOlderItem()
    }
  }

  removeOlderItem() {
    var key = this.keys.splice(0, 1)[0]
    this.totalBytes -= this.chunks[key].length
    delete this.chunks[key]
  }

  getItem(key) {
    return this.chunks[key];
  }

  contain(key) {
    return _.contains(this.keys, key)
  }
}

Storage.getInstance = function() {
  if (this._instance == undefined) {
    this._instance = new this();
  }
  return this._instance;
}

module.exports = Storage

