// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a Apache
// license that can be found in the LICENSE file.

var BaseObject = require('base_object');
var CDNRequester = require('./cdn_requester');
var P2PManager = require('./p2p_manager');
var Settings = require('./settings')

class ResourceRequester extends BaseObject {
  initialize(params) {
    this.cdnRequester = new CDNRequester()
    this.p2pManager = new P2PManager(params);
    this.currentState = params.currentState;
    this.isInitialBuffer = true
  }

  requestResource(resource, bufferLength, callback) {
    this.resource = resource
    this.callback = callback
    if (bufferLength < Settings.lowBufferLength && !this.isInitialBuffer) {
      this.requestToCDN()
    } else {
      this.p2pManager.requestResource(resource, this.callback, this.requestToCDN.bind(this))
    }
  }

  requestToCDN() {
    this.cdnRequester.requestResource(this.resource, this.callback)
  }
}

module.exports = ResourceRequester;
