// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

var BaseObject = require('base_object');
var Utils = require('./utils');
var Storage = require('./storage')

class CDNRequester extends BaseObject {
  get name() { return 'ChunksHandler'; }
  initialize() {
    this.storage = Storage.getInstance()
    this.utils = new Utils()
  }

  requestResource(resource, callback) {
    this.callback = callback
    this.resource = resource
    this.utils.request(resource, (event) => this.resourceLoaded(event), 'arraybuffer')
  }

  resourceLoaded(event) {
    var chunk = this.utils.base64ArrayBuffer(event.currentTarget.response)
    this.storage.setItem(this.resource, chunk)
    this.callback(chunk);
  }
}

module.exports = CDNRequester;
