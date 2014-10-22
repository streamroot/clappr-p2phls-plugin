// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a Apache
// license that can be found in the LICENSE file.

var BaseObject = require('base_object')
var BufferedChannel = require('rtc-bufferedchannel')
var Peer = require('./peer')
var Settings = require('./settings')
var _ = require('underscore')
var log = require('./log').getInstance()
var SwarmUtils = require('./swarm_utils')
var PlaybackInfo = require('./playback_info')

class Swarm extends BaseObject {
  constructor() {
    this.playbackInfo = PlaybackInfo.getInstance()
    this.utils = new SwarmUtils(this)
    this.peers = []
    this.satisfyElected = undefined
    this.satisfyCandidates = []
    this.chokedClients = 0
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
    var peer = this.utils.findPeer(id)
    this.peers = _.without(this.peers, peer)
    log.info("quit: " + id + " (remains: " + this.size() + ")")
    this.trigger('swarm:sizeupdate', {swarmSize: this.size()})
  }

  updatePeersScore() {
    var successPeer = this.utils.findPeer(this.satisfyElected)
    var goodPeers = _.union([successPeer], this.satisfyCandidates)
    var badPeers = _.difference(this.contributors, goodPeers)
    log.info("contributors good: " + goodPeers.length)
    this.utils.incrementScore(goodPeers)
    this.utils.incrementScore([successPeer]) //double satisfyElected score gain :)
    this.utils.decrementScore(badPeers)
  }

  sendTo(recipients, command, resource, content='') {
    if (recipients === 'contributors') {
      _.each(this.utils.contributors, function(peer) { peer.send(command, resource, content) }, this)
    } else {
      var peer = this.utils.findPeer(recipients)
      peer.send(command, resource, content);
    }
  }

  sendInterested(resource, callbackSuccess, callbackFail) {
    this.externalCallbackFail = callbackFail
    this.externalCallbackSuccess = callbackSuccess
    this.currentResource = resource
    if (this.satisfyElected) {
      //already have a satisfyElected with success, requesting directly
      log.info("directly requesting to " + this.satisfyElected)
      this.sendRequest()
    } else {
      this.sendTo('contributors', 'interested', resource)
      var timeout = this.playbackInfo.timeoutFor('interested')
      this.interestedTimeoutID = setTimeout(this.interestedFinished.bind(this), timeout)
    }
  }

  interestedFinished() {
    if (_.size(this.satisfyCandidates) > 0) {
      this.satisfyElected = this.utils.electSender(this.satisfyCandidates).ident
      log.info("round finished, candidates: " + _.size(this.satisfyCandidates) + ', selected: ' + this.satisfyElected)
      this.sendRequest()
    } else {
      log.info("round finished, no candidates.")
      this.callbackFail()
    }
  }

  sendRequest() {
    var timeout = this.playbackInfo.timeoutFor('request')
    this.requestFailID = setTimeout(this.callbackFail.bind(this), timeout)
    this.sendTo(this.satisfyElected, 'request', this.currentResource)
  }

  chokeReceived(resource) {
    if (this.currentResource === resource) {
      this.chokedClients += 1
    }
    if (this.chokedClients === _.size(this.utils.contributors)) {
      log.warn("all contributors choked, getting from cdn")
      clearInterval(this.interestedTimeoutID)
      this.callbackFail()
    }
  }

  containReceived(peer, resource) {
    if (this.currentResource === resource) {
      this.satisfyCandidates.push(peer)
    }
  }

  satisfyReceived(peer, resource, chunk) {
    if (this.satisfyElected === peer.ident && this.currentResource === resource) {
      this.externalCallbackSuccess(chunk, "p2p")
      this.updatePeersScore()
      this.rebootRoundVars()
    } else {
      // nothing could be worse than this. Someont sent you the entire chunk, but missed the time
      // and generated unnecessary traffic. Putting peer on the end of the swarm.
      log.warn("satisfy error for " + peer.ident +"!="+this.satisfyElected + " or " + this.currentResource + "!=" + resource)
      this.busyReceived(peer)
    }
  }

  busyReceived(peer) {
    var lowerScore = this.utils.getLowestScorePeer().score
    peer.score = lowerScore - Settings.points
    log.warn(peer.ident + " score is now: " + peer.score)
  }

  callbackFail() {
    this.utils.decrementScore(this.utils.contributors)
    this.rebootRoundVars()
    this.satisfyElected = undefined
    this.externalCallbackFail()
  }

  rebootRoundVars() {
    this.currentResource = undefined
    this.chokedClients = 0
    this.satisfyCandidates = []
    this.clearRequestFailInterval()
    this.trigger('swarm:sizeupdate', {swarmSize: this.size()})
  }

  clearRequestFailInterval() {
    clearInterval(this.requestFailID)
    this.requestFailID = 0
  }
}

module.exports = Swarm
