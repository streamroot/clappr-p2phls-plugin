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
    this.satisfyCandidate = undefined
    this.chunksSent = 0
    this.chokedClients = 0
  }

  size() {
    return this.peers.length
  }

  addPeer(id, dataChannel) {
    console.log("=> " + id)
    var bufferedChannel = BufferedChannel(dataChannel, {calcCharSize: false})
    var peer = new Peer({ident: id, dataChannel: bufferedChannel, swarm: this})
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

  get partners() {
    var orderedPeers = _.sortBy(this.peers, function (p) { return p.score }).reverse()
    if (this.peers.length > Settings.maxPartners) {
      return orderedPeers.slice(0, Settings.maxPartners)
    } else {
      return orderedPeers
    }
  }

  sendTo(recipients, command, resource, content='') {
    /* recipients: all, partners or peer ident
    command: interested, contain, request, satisfy */
    if (recipients === 'partners') {
      _.each(this.partners, function(peer) { peer.send(command, resource, content) }, this)
    } else if (recipients === 'all') {
      _.each(this.peers, function(peer) { peer.send(command, resource, content) }, this)
    } else {
      var peer = this.findPeer(recipients)
      peer.send(command, resource, content);
    }
  }

  sendInterested(resource, callbackSuccess, callbackFail) {
    this.externalCallbackFail = callbackFail
    this.externalCallbackSuccess = callbackSuccess
    this.interestedFailID = setTimeout(this.callbackFail.bind(this), Settings.timeout)
    this.currentResource = resource
    this.sendTo('partners', 'interested', resource)
  }

  chokeReceived(resource) {
    if (this.currentResource === resource) {
      this.chokedClients += 1
      if (this.chokedClients === this.partners.length) {
        this.callbackFail()
      }
    }
  }

  addSatisfyCandidate(peerId, resource) {
    if (this.satisfyCandidate || this.currentResource !== resource) return
    if (this.interestedFailID) {
      this.clearInterestedFailInterval()
      this.requestFailID = setTimeout(this.callbackFail.bind(this), Settings.timeout)
    }
    this.satisfyCandidate = peerId
    this.sendRequest(peerId, resource)
  }

  sendRequest(peerId, resource) {
    this.sendTo(peerId, 'request', resource)
  }

  resourceReceived(peer, resource, chunk) {
    //TODO increase peer score
    if (this.satisfyCandidate === peer && this.currentResource === resource) {
      this.externalCallbackSuccess(chunk, "p2p")
      this.updatePartnerScore(Settings.points)
      this.rebootRoundVars()
      this.clearRequestFailInterval()
    }
  }

  callbackFail() {
    //TODO decrease peer score
    this.updatePartnerScore(Settings.points * -1)
    this.rebootRoundVars()
    this.clearInterestedFailInterval()
    this.clearRequestFailInterval()
    this.externalCallbackFail()
  }

  updatePartnerScore(points) {
    if (this.satisfyCandidate) {
      var peer = this.findPeer(this.satisfyCandidate)
      peer.score += points
    }
  }

  rebootRoundVars(roundSuccess) {
    this.currentResource = undefined
    this.satisfyCandidate = undefined
    this.chokedClients = 0
  }

  clearInterestedFailInterval() {
    clearInterval(this.interestedFailID)
    this.interestedFailID = 0
  }

  clearRequestFailInterval() {
    clearInterval(this.requestFailID)
    this.requestFailID = 0
  }
}

module.exports = Swarm
