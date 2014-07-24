// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

var BaseObject = require('base_object');
var BufferedChannel = require('rtc-bufferedchannel');
var Peer = require('./peer')
var Settings = require('./settings')
var _ = require('underscore')


class Swarm extends BaseObject {
  initialize() {
    this.peers = []
    //TODO glue a partnership algorithm based on QoE study
    this.partners = this.peers
    this.satisfyCandidate = undefined
  }

  size() {
    return this.peers.length
  }

  addPeer(id, dataChannel) {
    console.log("=> " + id)
    var bufferedChannel = BufferedChannel(dataChannel, {calcCharSize: false})
    var peer = new Peer({ident: id, dataChannel: dataChannel, bufferedChannel: bufferedChannel, swarm: this})
    this.peers.push(peer)
  }

  removePeer(id) {
    var peer = this.findPeer(id)
    this.peers = _.without(this.peers, peer)
    console.log("<= " + id + ", remains: " + this.size())
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

  sendDesire(resource, callbackSuccess, callbackFail) {
    /* will try to download from swarm, fallbacking to callbackFail
      after timeout */
    this.externalCallbackFail = callbackFail
    this.externalCallbackSuccess = callbackSuccess
    this.desireFailID = setTimeout(this.callbackFail.bind(this), Settings.timeout)
    this.currentResource = resource
    this.sendTo('partners', 'desire', resource)
  }

  addSatisfyCandidate(peerId, resource) {
    if (resource !== this.currentResource) return
    if (this.desireFailID) {
      this.clear(this.desireFailID)
      this.requestFailID = setTimeout(this.callbackFail.bind(this), Settings.timeout)
    }
    this.satisfyCandidate = peerId
    this.sendRequest(peerId, resource)
  }

  sendRequest(peerId, resource) {
    this.sendTo(peerId, 'request', resource)
    this.currentResource = undefined
  }

  resourceReceived(peer, chunk) {
    //TODO increase peer score
    if (this.satisfyCandidate === peer) {
      console.log("p2p! sending to player " + chunk.length)
      this.externalCallbackSuccess(chunk)
    }
  }

  callbackFail() {
    //TODO decrease peer score
    this.clear(this.requestFailID)
    this.clear(this.desireFailID)
    this.externalCallbackFail()
  }

  clear(id) {
    clearInterval(id)
    id = 0
  }
}

module.exports = Swarm
