// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a Apache
// license that can be found in the LICENSE file.

var BaseObject = require('base_object')
var _ = require('underscore')

class PlaybackInfo extends BaseObject {
  constructor() {
    this.data = {
      'chunks': { 'recvCDN': 0, 'recvP2P': 0, 'sentP2P': 0 },
      'bufferLength': 0
    }
  }

  setMain(main) {
    this.main = main
    this.data.delay = this.main.el.getDelay()
    this.addEventListeners()
    this.bufferLengthTimer = setInterval(() => this.updateBufferLength(), 1000)
    this.triggerStats({status: "on"})
  }

  updateData(metrics) {
    this.data = _.extend(this.data, metrics)
    console.log(this.data)
  }

  timeoutFor(command) {
    var segmentSize = this.data.segmentSize? this.data.segmentSize * 1000: 2000
    if (command === 'interested') {
      var timeout = segmentSize / 3
      return timeout > 2000? 2000: timeout
    } else if (command === 'request') {
      return segmentSize * 0.6
    }
  }

  addEventListeners() {
    this.listenTo(this.main.resourceRequester.p2pManager.swarm, "swarm:sizeupdate", (event) => this.updateSwarmSize(event))
    this.listenTo(this.main.uploadHandler, 'uploadhandler:update', (event) => this.updateUploadSlots(event))
    Clappr.Mediator.on(this.main.uniqueId + ':fragmentloaded', () => this.onFragmentLoaded())
  }

  onFragmentLoaded() {
    var bitrate = Math.floor(this.main.getCurrentBitrate() / 1000)
    bitrate =  !_.isNaN(bitrate) ? bitrate : 'UNKNOWN'
    var data = {state: this.main.currentState, currentBitrate: bitrate}
    this.updateData(data)
    this.triggerStats(data)
  }

  updateSwarmSize(data) {
    this.triggerStats(data)
    this.updateData(data)
  }

  updateBufferLength() {
    this.bufferLength = this.main.el.globoGetbufferLength() || 0
    var data = {bufferLength: this.bufferLength}
    this.updateData(data)
    this.triggerStats(data)
  }

  updateChunkStats(method=null) {
    console.log("update chunk stats", method)
    if (method === "p2p") this.data.chunks.recvP2P++
    else if (method === "cdn") this.data.chunks.recvCDN++
    else if (method === "p2psent") this.data.chunks.sentP2P++
    var stats = {
      chunksFromP2P: this.data.chunks.recvP2P,
      chunksFromCDN: this.data.chunks.recvCDN,
      chunksSent: this.data.chunks.sentP2P
    }
    this.triggerStats(stats)
  }

  updateUploadSlots(metrics) {
    this.data.uploadSlots = metrics
    this.triggerStats(metrics)
  }

  triggerStats(metrics) {
    this.main.trigger('playback:p2phlsstats:add', metrics)
    this.main.trigger('playback:stats:add', metrics)
  }
}

PlaybackInfo.getInstance = function() {
  if (this._instance === undefined) {
    this._instance = new this()
  }
  return this._instance
}

module.exports = PlaybackInfo
