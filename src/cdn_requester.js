// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

var BaseObject = require('base_object');
var Storage = require('./storage')

class CDNRequester extends BaseObject {
  get name() { return 'ChunksHandler'; }
  initialize() {
    this.storage = Storage.getInstance()
    this.utils = new Worker("asyncxhr.js")
    this.utils.onmessage = (e) => this.resourceLoaded(e.data)
  }

  requestResource(resource, callback) {
    this.callback = callback
    window.callback = this.callback
    this.resource = resource
    this.utils.postMessage(resource)
  }

  resourceLoaded(chunk) {
    this.storage.setItem(this.resource, chunk)
    this.callback(chunk);
  }
}

module.exports = CDNRequester;
