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
  constructor() {
    this.peers = []
    this.satisfyCandidate = undefined
    this.chunksSent = 0
    this.chokedClients = 0
    this.avgSegmentSize = 0
    this.peersContainsResource = []
  }

  size() {
    return _.size(this.peers)
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

  updatePeersScore() {
    var successPeer = this.findPeer(this.satisfyCandidate)
    var goodPeers = _.union([successPeer], this.peersContainsResource)
    var badPeers = _.difference(this.contributors, goodPeers)
    log.info("contributors good: " + goodPeers.length)
    this.incrementScore(goodPeers)
    this.decrementScore(badPeers)
  }

  incrementScore(peers) {
    this.changeScore(peers, Settings.points)
  }

  decrementScore(peers) {
    this.changeScore(peers, Settings.points * -1)
  }

  changeScore(peers, points) {
    _.each(peers, function(peer) { peer.score += points }, this)
  }

  get contributors() {
    var orderedPeers = _.sortBy(this.peers, function (p) { return p.score }).reverse()
    if (_.size(this.peers) > Settings.maxContributors) {
      var slice = orderedPeers.slice(0, Settings.maxContributors)
      return slice
    } else {
      return orderedPeers
    }
  }

  getLowestScorePeer() {
    return _.first(_.sortBy(this.peers, function(p) { return p.score }))
  }

  sendTo(recipients, command, resource, content='') {
    if (recipients === 'contributors') {
      _.each(this.contributors, function(peer) { peer.send(command, resource, content) }, this)
    } else {
      var peer = this.findPeer(recipients)
      peer.send(command, resource, content);
    }
  }

  sendInterested(resource, callbackSuccess, callbackFail) {
    this.externalCallbackFail = callbackFail
    this.externalCallbackSuccess = callbackSuccess
    this.currentResource = resource
    this.sendTo('contributors', 'interested', resource)
    var timeout = this.getTimeoutFor('interested')
    this.interestedFailID = setTimeout(this.callbackFail.bind(this), timeout)
  }

  chokeReceived(resource) {
    if (this.currentResource === resource) {
      this.chokedClients += 1
    }
    if (this.chokedClients === _.size(this.contributors)) {
      log.warn("all contributors choked, getting from cdn")
      this.callbackFail()
    }
  }

  containReceived(peer, resource) {
    if (this.currentResource !== resource) return
    if (this.satisfyCandidate) {
      log.warn("contain received but already have satisfy candidate")
      this.peersContainsResource.push(peer)
    } else {
      this.satisfyCandidate = peer.ident
      this.clearInterestedFailInterval()
      this.requestFailID = setTimeout(this.callbackFail.bind(this), this.getTimeoutFor('request'))
      this.sendTo(this.satisfyCandidate, 'request', resource)
    }
  }

  satisfyReceived(peer, resource, chunk) {
    if (this.satisfyCandidate === peer.ident && this.currentResource === resource) {
      this.externalCallbackSuccess(chunk, "p2p")
      this.updatePeersScore()
      this.rebootRoundVars()
    } else {
      log.warn("satisfy received for a wrong resource or satisfyCandidate")
    }
  }

  busyReceived(peer) {
    var lowerScore = this.getLowestScorePeer().score
    if (lowerScore < 0) {
      peer.score = lowerScore - Settings.points
    } else {
      peer.score = 0
    }
    log.warn("busy received, changing " + peer.ident + " score to: " + peer.score)
  }

  callbackFail() {
    this.decrementScore(this.contributors)
    this.rebootRoundVars()
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
    this.clearRequestFailInterval()
    this.clearInterestedFailInterval()
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
