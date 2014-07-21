// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

var BaseObject = require('base_object');
var BufferedChannel = require('rtc-bufferedchannel');
var Peer = require('./peer')
var _ = require('underscore')


class Swarm extends BaseObject {
  initialize() {
    this.peers = []
  }

  addPeer(id, dataChannel) {
    var bufferedChannel = BufferedChannel(dataChannel)
    var peer = new Peer({ident: id, dataChannel: dataChannel, bufferedChannel: bufferedChannel})
    this.peers.push(peer)
  }

  removePeer(id) {
    var peer = this.findPeer(id)
    this.peers = _.without(this.peers, peer)
  }

  findPeer(id) {
    return _.find(this.peers, function (peer) {
      return !!(peer.ident === id)
    }, this)
  }
}

module.exports = Swarm
