// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

var BaseObject = require('base_object');


class Peer extends BaseObject {
  initialize(params) {
    console.log('peer created: ' + params.ident)
    this.ident = params.ident
    this.dataChannel = params.dataChannel
    this.bufferedDataChannel = params.bufferedChannel
  }
}

module.exports = Peer
