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
    this.peersContainsResource = []
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
    log.info("quit: " + id + " (remains: " + this.size() + ")")
    this.trigger('swarm:sizeupdate', {swarmSize: this.size()})
  }

  findPeer(id) {
    return _.find(this.peers, function (peer) {
      return (peer.ident === id)
    }, this)
  }

  changeScore(peers, points) {
    _.each(peers, function(peer) {
      log.warn("Changing " + peer.ident + " score: " + peer.score + " -> " + (peer.score + points))
      peer.score += points
    }, this)
  }

  get contributors() {
    var activePeers = _.filter(this.peers, function (p) { return p.active })
    var orderedPeers = _.sortBy(activePeers, function (p) { return p.score }).reverse()
    if (this.peers.length > Settings.maxPartners) {
      return orderedPeers.slice(0, Settings.maxContributors)
    } else {
      return orderedPeers
    }
  }

  sendTo(recipients, command, resource, content='') {
    /* recipients: all, contributors or peer ident
    command: interested, contain, request, satisfy */
    log.debug("sending _" + command + "_ to " + recipients)
    if (recipients === 'contributors') {
      _.each(this.contributors, function(peer) { peer.send(command, resource, content) }, this)
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
    this.sendTo('contributors', 'interested', resource)
  }

  chokeReceived(resource) {
    if (this.currentResource === resource) {
      this.chokedClients += 1
      if (this.chokedClients === this.contributors.length) {
        log.warn("all contributors choked, getting from cdn")
        this.callbackFail()
      }
    }
  }

  containReceived(peerId, resource) {
    if (this.currentResource !== resource) return
    if (this.satisfyCandidate) {
      log.warn("contain received but already have satisfy candidate")
      this.peersContainsResource.push(this.findPeer(peerId))
    } else {
      this.satisfyCandidate = peerId
    }
    if (this.interestedFailID) {
      this.clearInterestedFailInterval()
      this.requestFailID = setTimeout(this.callbackFail.bind(this), this.getTimeoutFor('request'))
    }
    this.sendTo(this.satisfyCandidate, 'request', resource)
  }

  resourceReceived(peer, resource, chunk) {
    if (this.satisfyCandidate === peer && this.currentResource === resource) {
      this.externalCallbackSuccess(chunk, "p2p")
      var successPeer = this.findPeer(this.satisfyCandidate)
      this.changeScore(_.union([successPeer], this.peersContainsResource), Settings.points)
      this.rebootRoundVars()
      this.clearRequestFailInterval()
    }
  }

  callbackFail() {
    this.changeScore(this.contributors, Settings.points * -1)
    this.rebootRoundVars()
    this.clearInterestedFailInterval()
    this.clearRequestFailInterval()
    this.externalCallbackFail()
  }

  getTimeoutFor(command) {
    var segmentSize = this.avgSegmentSize > 0? this.avgSegmentSize * 1000: 1000
    if (command === 'interested') {
      var timeout = segmentSize / 4
      return timeout > 2000? 2000: timeout
    } else if (command === 'request') {
      return segmentSize * 0.6
    }
  }

  rebootRoundVars() {
    this.currentResource = undefined
    this.satisfyCandidate = undefined
    this.chokedClients = 0
    this.peersContainsResource = []
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
