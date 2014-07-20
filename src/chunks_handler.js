// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

var BaseObject = require('base_object');
var CDNRequester = require('./cdn_requester');

class ChunksHandler extends BaseObject {
  initialize(params) {
    this.cdnRequester = new CDNRequester()
//    this.p2pRequester = P2PRequester();
  }

  requestResource(resource, callback) {
    this.cdnRequester.requestResource(resource, callback)
  }
}

module.exports = ChunksHandler;
