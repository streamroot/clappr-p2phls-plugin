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
    //TODO glue a partnership algorithm based on QoE study
    this.partners = this.peers
  }

  size() {
    return this.peers.length
  }

  addPeer(id, dataChannel) {
    console.log("new peer: " + id)
    var bufferedChannel = BufferedChannel(dataChannel, {calcCharSize: false})
    var peer = new Peer({ident: id, dataChannel: dataChannel, bufferedChannel: bufferedChannel, swarm: this})
    this.peers.push(peer)
  }

  removePeer(id) {
    var peer = this.findPeer(id)
    this.peers = _.without(this.peers, peer)
    console.log("bye peer: " + id + ", remains: " + this.size())
  }

  findPeer(id) {
    return _.find(this.peers, function (peer) {
      return !!(peer.ident === id)
    }, this)
  }

  sendTo(recipients, command, resource, content='') {
    /* recipients: all, partners or peer ident
    command: desire, has, request, satisfy */
    if (recipients === 'partners') {
      _.each(this.partners, function(peer) { peer.send(command, resource, content) }, this)
    } else if (recipients === 'all') {
      _.each(this.peers, function(peer) { peer.send(command, resource, content) }, this)
    } else {
      var peer = this.findPeer(recipients)
      peer.send(command, resource, content);
    }
  }

  sendDesire(resource, callbackSuccess, callbackFail, timeout) {
    /* will try to download from swarm, fallbacking to callbackFail
      after timeout */
    this.externalCallbackFail = callbackFail
    this.desireFailID = setTimeout(this.externalCallbackFail, timeout)
    this.currentResource = resource
    this.sendTo('partners', 'desire', resource)
  }

  addCandidateForResource(peerId, resource) {
    console.log("found candidate for" + resource + "(" + peerId + ")")
    if (resource !== this.currentResource) return
//    if (this.desireFailID) clearInterval(this.desireFailID)
  }

}

module.exports = Swarm
