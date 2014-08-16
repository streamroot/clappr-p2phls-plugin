// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a Apache
// license that can be found in the LICENSE file.

var BaseObject = require('base_object');
var BufferedChannel = require('rtc-bufferedchannel');
var Peer = require('./peer')
var Settings = require('./settings')
var _ = require('underscore')
var log = require('./log');


class Swarm extends BaseObject {
  initialize() {
    this.peers = []
    this.satisfyCandidate = undefined
    this.chunksSent = 0
    this.chokedClients = 0
    this.avgSegmentSize = 0
  }

  size() {
    return this.peers.length
  }

  addPeer(id, dataChannel) {
    log.info("join: " + id)
    var bufferedChannel = BufferedChannel(dataChannel, {calcCharSize: false})
    var peer = new Peer({ident: id, dataChannel: bufferedChannel, swarm: this})
    this.peers.push(peer)
    this.trigger('swarm:sizeupdate', {swarmSize: this.size()})
  }

  removePeer(id) {
    var peer = this.findPeer(id)
    this.peers = _.without(this.peers, peer)
    log.info("quit: " + id + "(remains: " + this.size() + ")")
    this.trigger('swarm:sizeupdate', {swarmSize: this.size()})
  }

  findPeer(id) {
    return _.find(this.peers, function (peer) {
      return !!(peer.ident === id)
    }, this)
  }

  get partners() {
    var activePeers = _.filter(this.peers, function (p) { return p.active })
    var orderedPeers = _.sortBy(activePeers, function (p) { return p.score }).reverse()
    if (this.peers.length > Settings.maxPartners) {
      return orderedPeers.slice(0, Settings.maxPartners)
    } else {
      return orderedPeers
    }
  }

  sendTo(recipients, command, resource, content='') {
    /* recipients: all, partners or peer ident
    command: interested, contain, request, satisfy */
    log.debug("sending _" + command + "_ to " + recipients)
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
    this.interestedFailID = setTimeout(this.callbackFail.bind(this), this.getTimeoutFor('interested'))
    this.currentResource = resource
    this.sendTo('partners', 'interested', resource)
  }

  chokeReceived(resource) {
    if (this.currentResource === resource) {
      this.chokedClients += 1
      if (this.chokedClients === this.partners.length) {
        log.warn("all partners choked, getting from cdn")
        this.callbackFail()
      }
    }
  }

  addSatisfyCandidate(peerId, resource) {
    if (this.satisfyCandidate || this.currentResource !== resource) return //TODO count missed chunks?
    if (this.interestedFailID) {
      this.clearInterestedFailInterval()
      this.requestFailID = setTimeout(this.callbackFail.bind(this), this.getTimeoutFor('request'))
    }
    this.satisfyCandidate = peerId
    this.sendTo(this.satisfyCandidate, 'request', resource)
  }

  getTimeoutFor(command) {
    var segmentSize = this.avgSegmentSize * 1000
    if (command === 'interested') {
      return (segmentSize / 4)
    } else if (command === 'request') {
      return (segmentSize / 2)
    }
  }

  resourceReceived(peer, resource, chunk) {
    if (this.satisfyCandidate === peer && this.currentResource === resource) {
      this.externalCallbackSuccess(chunk, "p2p")
      if (this.satisfyCandidate) {
        this.findPeer(this.satisfyCandidate).score += Settings.points
      }
      this.rebootRoundVars()
      this.clearRequestFailInterval()
    }
  }

  callbackFail() {
    _.each(this.partners, function(peer) { peer.score -= Settings.points }, this)
    this.rebootRoundVars()
    this.clearInterestedFailInterval()
    this.clearRequestFailInterval()
    this.externalCallbackFail()
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
