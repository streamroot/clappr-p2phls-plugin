// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a Apache
// license that can be found in the LICENSE file.

var BaseObject = require('base_object')
var CDNRequester = require('./cdn_requester')
var P2PManager = require('./p2p_manager')
var Settings = require('./settings')
var _ = require('underscore')
var log = require('./log').getInstance()

class ResourceRequester extends BaseObject {
  constructor(params) {
    this.cdnRequester = new CDNRequester()
    this.p2pManager = new P2PManager(params)
    this.isInitialBuffer = true
    this.sameSource = 0
  }

  requestResource(resource, bufferLength, callback) {
    if (resource === this.resource) {
      this.sameSource += 1
    }
    this.resource = resource
    this.callback = callback
    if (bufferLength < Settings.lowBufferLength || this.isInitialBuffer || _.size(this.p2pManager.swarm.utils.contributors) === 0 || this.sameSource >= 3) {
      this.requestToCDN()
      this.sameSource = 0
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
