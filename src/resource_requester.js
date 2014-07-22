// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

var BaseObject = require('base_object');
var CDNRequester = require('./cdn_requester');
var P2PManager = require('./p2p_manager');

class ResourceRequester extends BaseObject {
  initialize(params) {
    this.cdnRequester = new CDNRequester()
    this.p2pManager = new P2PManager();
  }

  requestResource(resource, callback) {
    this.resource = resource
    this.callback = callback
    this.p2pManager.requestResource(resource, this.callback.bind(this), this.requestToCDN.bind(this))
  }

  requestToCDN() {
    this.cdnRequester.requestResource(this.resource, this.callback)
  }
}

module.exports = ResourceRequester;
