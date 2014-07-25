// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

var Settings = require("./settings")
var _ = require("underscore")

class Storage {
  constructor() {
    // making all operations in associative arrays
    // to avoid unecessary operations in a big structure
    this.keys = []
    this.values = []
    this.totalBytes = 0
  }

  setItem(key, value) {
    this.keys.push(key)
    this.values.push(value)
    this.totalBytes += value.length
    if (this.totalBytes > Settings.maxStorageBytes) {
      this.removeOlderItem()
    }
  }

  removeOlderItem() {
    this.keys.splice(0, 1)
    this.values.splice(0, 1)
  }

  getItem(key) {
    var index = this.keys.indexOf(key)
    if (index > 0) {
      return this.values[index]
    }
    return ""
  }

  clear() {
    this.keys = []
    this.values = []
    this.totalBytes = 0
  }

  length() {
    return this.keys.length
  }

  contain(key) {
    /* considering chunks from position 1
    to avoid race condition on signalling */
    return this.keys.indexOf(key) > 0? true: false
  }
}

Storage.getInstance = function() {
  if (this._instance == undefined) {
    this._instance = new this();
    this.chunks = {}
  }
  return this._instance;
}

module.exports = Storage

