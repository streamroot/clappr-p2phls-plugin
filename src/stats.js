// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a Apache
// license that can be found in the LICENSE file.

var BaseObject = require('base_object');
var _ = require('underscore')

class Stats extends BaseObject {
  constructor() {
    this.recv_cdn = 0
    this.recv_p2p = 0
    this.bufferLength = 0
  }

  setEmitter(main) {
    this.main = main
    this.addEventListeners()
    this.bufferLengthTimer = setInterval(() => this.updateBufferLength(), 1000)
    this.updateStats()
    this.triggerStats({status: "on"})
  }

  addEventListeners() {
    this.listenTo(this.main.resourceRequester.p2pManager.swarm, "swarm:sizeupdate", (event) => this.triggerStats(event))
    this.listenTo(this.main.uploadHandler, 'uploadhandler:update', (event) => this.triggerStats(event))
    Clappr.Mediator.on(this.main.uniqueId + ':fragmentloaded', () => this.onFragmentLoaded())
  }

  onFragmentLoaded() {
    var bitrate = Math.floor(this.main.getCurrentBitrate() / 1000)
    bitrate =  !_.isNaN(bitrate) ? bitrate : 'UNKNOWN'
    this.triggerStats({state: this.main.currentState, currentBitrate: bitrate})
  }

  updateBufferLength() {
    this.bufferLength = this.main.el.globoGetbufferLength() || 0
    this.triggerStats({bufferLength: this.bufferLength})
  }

  updateStats(method=null) {
    if (method === "p2p") this.recv_p2p++
    else if (method === "cdn") this.recv_cdn++
    var chunksSent = this.main.resourceRequester.p2pManager.swarm.chunksSent
    var stats = {chunksFromP2P: this.recv_p2p, chunksFromCDN: this.recv_cdn, chunksSent: chunksSent}
    this.triggerStats(stats)
  }

  triggerStats(metrics) {
    this.main.trigger('playback:p2phlsstats:add', metrics)
    this.main.trigger('playback:stats:add', metrics)
  }
}

Stats.getInstance = function() {
  if (this._instance === undefined) {
    this._instance = new this()
  }
  return this._instance
}

module.exports = Stats
