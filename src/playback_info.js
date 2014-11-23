// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a Apache
// license that can be found in the LICENSE file.

var BaseObject = require('base_object')
var Settings = require('./settings')
var _ = require('underscore')

class PlaybackInfo extends BaseObject {
  constructor() {
    this.data = {
      'chunks': {chunksFromCDN: 0, chunksFromP2P: 0, chunksSent: 0},
      'bufferLength': 0,
      'bandwidth': 0,
    }
    this.bwHistory = []
  }

  setMain(main) {
    this.main = main
    this.triggerStats({status: "on", occupiedSlots: 0, totalSlots: Settings.maxUploadSlots})
    this.updateData({delay: this.main.el.getDelay()})
    this.data.delay = this.main.el.getDelay()
    this.addEventListeners()
  }

  updateData(metrics) {
    this.triggerStats(metrics)
    this.data = _.extend(this.data, metrics)
  }

  timeoutFor(command) {
    var segmentSize = this.data.segmentSize? this.data.segmentSize * 1000: 2000
    if (command === 'interested') {
      var timeout = segmentSize / 3
      return timeout > 2000? 2000: timeout
    } else if (command === 'request') {
      if (this.data.lastDownloadType === 'p2p') {
        return segmentSize
      } else {
        return segmentSize * 0.6
      }
    }
  }

  addEventListeners() {
    this.listenTo(this.main.resourceRequester.p2pManager.swarm, "swarm:sizeupdate", (event) => this.updateData(event))
    this.listenTo(this.main.resourceRequester.cdnRequester, 'cdnrequester:downloadtime', (event) => this.updateBandwidth(event))
    this.listenTo(this.main.uploadHandler, 'uploadhandler:update', (event) => this.updateUploadSlots(event))
    Clappr.Mediator.on(this.main.uniqueId + ':fragmentloaded', () => this.onFragmentLoaded())
  }

  updateBandwidth(event) {
    if (!this.data.currentBitrate || !this.data.segmentSize) return
    var currentBw = this.data.currentBitrate * this.data.segmentSize / (event.downloadTime/1000)
    // nearest rank method, 80th percentile (#101)
    this.data.bandwidth = this.calculateBandwidth(currentBw)
  }

  calculateBandwidth(currentBw) {
    this.updateBwHistory(currentBw)
    var sortedBwHistory = this.bwHistory
    sortedBwHistory.sort(function(a,b) { return a-b })
    var position = Math.round(0.8 * sortedBwHistory.length)
    return sortedBwHistory[position] || sortedBwHistory[0]
  }

  updateBwHistory(currentBw) {
    this.bwHistory.push(currentBw)
    if (this.bwHistory.length > 10) {
      this.bwHistory = _.rest(this.bwHistory)
    }
  }

  onFragmentLoaded() {
    var bitrate = Math.floor(this.main.getCurrentBitrate() / 1000)
    var bufferLength = this.main.el.globoGetbufferLength()
    bitrate =  !_.isNaN(bitrate) ? bitrate : 'UNKNOWN'
    bufferLength = !_.isNaN(bufferLength) ? bufferLength: 0
    var data = {
      state: this.main.currentState,
      currentBitrate: bitrate,
      bufferLength: bufferLength.toFixed(2),
      segmentSize: this.getAverageSegmentSize(),
      levels: this.main.getLevels()
    }
    this.updateData(data)
  }

  updateChunkStats(method=null) {
    if (method === "p2p") {
      this.data.chunks.chunksFromP2P++
      this.data.lastDownloadType = "p2p"
    } else if (method === "cdn") {
      this.data.chunks.chunksFromCDN++
      this.data.lastDownloadType = "cdn"
    } else if (method === "p2psent") {
      this.data.chunks.chunksSent++
    }
    this.triggerStats(this.data.chunks)
  }

  updateUploadSlots(metrics) {
    this.data.uploadSlots = metrics
    this.triggerStats(metrics)
  }

  triggerStats(metrics) {
    this.main.trigger('playback:stats:add', metrics)
  }

  getAverageSegmentSize() {
    if (!this.avgSegmentSize || this.avgSegmentSize === 0 && this.main.getLevels().length > 0) {
      this.avgSegmentSize = Math.round(this.main.getLevels()[0].averageduration) || 0
    }
    return this.avgSegmentSize
  }

}

PlaybackInfo.getInstance = function() {
  if (this._instance === undefined) {
    this._instance = new this()
  }
  return this._instance
}

module.exports = PlaybackInfo
