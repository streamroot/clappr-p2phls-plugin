// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a Apache
// license that can be found in the LICENSE file.

var BaseObject = require('base_object')
var _ = require('underscore')
var Settings = require('./settings')

class SwarmUtils extends BaseObject {
  constructor(swarm) {
    this.swarm = swarm
  }

  findPeer(id) {
    return _.find(this.swarm.peers, function (peer) {
      return (peer.ident === id)
    }, this)
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
    var orderedPeers = _.sortBy(this.swarm.peers, function (p) { return p.score }).reverse()
    if (_.size(this.swarm.peers) > Settings.maxContributors) {
      var slice = orderedPeers.slice(0, Settings.maxContributors)
      return slice
    } else {
      return orderedPeers
    }
  }

  getLowestScorePeer() {
    return _.first(_.sortBy(this.swarm.peers, function(p) { return p.score }))
  }

  timeoutFor(command) {
    var segmentSize = this.swarm.avgSegmentSize > 0? this.swarm.avgSegmentSize * 1000: 1000
    if (command === 'interested') {
      var timeout = segmentSize / 3
      return timeout > 2000? 2000: timeout
    } else if (command === 'request') {
      return segmentSize * 0.6
    }
  }
}

module.exports = SwarmUtils
