// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a Apache
// license that can be found in the LICENSE file.

var BaseObject = require('base_object')
var CDNRequester = require('./cdn_requester')
var P2PManager = require('./p2p_manager')
var Settings = require('./settings')
var Storage = require('./storage')

class ResourceRequester extends BaseObject {
  constructor(params) {
    this.cdnRequester = new CDNRequester()
    this.p2pManager = new P2PManager(params)
    this.storage = Storage.getInstance()
    this.isInitialBuffer = true
  }

  requestResource(resource, bufferLength, callback) {
    this.resource = resource
    this.callback = callback
    if (this.storage.contain(resource)) {
      // it means that something went wrong on flash side. getting from cdn.
      this.requestToCDN()
    } else if (bufferLength < Settings.lowBufferLength || this.isInitialBuffer || this.p2pManager.swarm.size() === 0) {
      this.requestToCDN()
    } else {
      this.requestToP2P()
    }
  }

  requestToCDN() {
    this.cdnRequester.requestResource(this.resource, this.callback)
  }

  requestToP2P() {
    this.p2pManager.requestResource(this.resource, this.callback, this.requestToCDN.bind(this))
  }
}

module.exports = ResourceRequester;
