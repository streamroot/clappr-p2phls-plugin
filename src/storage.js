// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a Apache
// license that can be found in the LICENSE file.

var Settings = require("./settings")
var _ = require("underscore")
var log = require('./log').getInstance()

class Storage {
  constructor() {
    this.keys = []
    this.chunks = {}
  }

  setItem(key, value) {
    var normalizedKey = key.match(/(.*.[ts|aac])\??.*?/)[1]
    if (_.has(this.chunks, normalizedKey)) {
      log.warn("already have this chunk on storage: " + normalizedKey)
    } else {
      this.keys.push(normalizedKey)
      this.chunks[normalizedKey] = value
      this.updateSize()
    }
  }

  get size() {
    return this.keys.length
  }

  updateSize() {
    if (this.size > Settings.maxStorageChunks) {
      this.removeOlderItem()
    }
  }

  removeOlderItem() {
    var key = this.keys.splice(0, 1)[0]
    delete this.chunks[key]
  }

  getItem(key) {
    var normalizedKey = key.match(/(.*.[ts|aac])\??.*?/)[1]
    return this.chunks[normalizedKey]
  }

  contain(key) {
    var normalizedKey = key.match(/(.*.[ts|aac])\??.*?/)[1]
    return _.contains(this.keys, normalizedKey)
  }
}

Storage.getInstance = function() {
  if (this._instance === undefined) {
    this._instance = new this();
  }
  return this._instance;
}

module.exports = Storage

