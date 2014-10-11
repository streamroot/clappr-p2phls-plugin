// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by Apache
// license that can be found in the LICENSE file.

var log = require('./log')
var Settings = require('./settings')
var ResourceRequester = require('./resource_requester')
var UploadHandler = require('./upload_handler')

var JST = require('./jst')
var HLS = require('./hls')

class P2PHLS extends HLS {
  get name() { return 'p2phls' }
  get tagName() { return 'object' }
  get template() { return JST.p2phls }
  get attributes() {
    return {
      'data-p2phls': '',
      'type': 'application/x-shockwave-flash'
    }
  }

  constructor(options) {
    options.swfPath = "assets/P2PHLSPlayer.swf"
    this.createResourceRequester(options.bemtvTracker)
    this.uploadHandler = UploadHandler.getInstance()
    super(options)
  }

  addListeners() {
    Clappr.Mediator.on(this.uniqueId + ':flashready', () => this.bootstrap())
    Clappr.Mediator.on(this.uniqueId + ':timeupdate', () => this.updateTime())
    Clappr.Mediator.on(this.uniqueId + ':playbackstate', (state) => this.setPlaybackState(state))
    Clappr.Mediator.on(this.uniqueId + ':highdefinition', (isHD) => this.updateHighDefinition(isHD))
    Clappr.Mediator.on(this.uniqueId + ':playbackerror', () => this.flashPlaybackError())
    Clappr.Mediator.on(this.uniqueId + ':requestresource', (url) => this.requestResource(url))
    this.listenTo(this.resourceRequester.p2pManager.swarm, "swarm:sizeupdate", (event) => this.triggerStats(event))
    this.listenTo(this.uploadHandler, 'uploadhandler:update', (event) => this.triggerStats(event))
  }

  stopListening() {
    Clappr.Mediator.off(this.uniqueId + ':flashready')
    Clappr.Mediator.off(this.uniqueId + ':timeupdate')
    Clappr.Mediator.off(this.uniqueId + ':playbackstate')
    Clappr.Mediator.off(this.uniqueId + ':highdefinition')
    Clappr.Mediator.off(this.uniqueId + ':playbackerror')
  }

  bootstrap() {
    super()
    this.el.playerSetminBufferLength(6)
    this.el.playerSetlowBufferLength(Settings.lowBufferLength)
    this.recv_cdn = 0
    this.recv_p2p = 0
    this.bufferLength = 0
    this.updateStats()
    this.triggerStats({status: "on"})
  }

  setPlaybackState(state) {
    if (state === 'PLAYING' && this.resourceRequester.isInitialBuffer) {
      this.resourceRequester.isInitialBuffer = false
    }
    super(state)
    this.triggerStats({state: this.currentState, currentBitrate: this.toKB(this.getCurrentBitrate())})
  }

  createResourceRequester(tracker) {
    var requesterOptions = {
      swarm: btoa(this.src),
      tracker: tracker
    }
    this.resourceRequester = new ResourceRequester(requesterOptions)
  }

  requestResource(url) {
    this.currentUrl = url
    this.resourceRequester.p2pManager.swarm.avgSegmentSize = this.getAverageSegmentSize()
    this.resourceRequester.requestResource(url, this.bufferLength, (chunk, method) => this.resourceLoaded(chunk, method))
  }

  resourceLoaded(chunk, method) {
    if (this.currentUrl) {
      this.currentUrl = null
      this.el.resourceLoaded(chunk)
      this.updateStats(method)
    } else {
      log.debug("It seems a deadlock happened with timers on swarm.")
    }
  }

  updateStats(method=null) {
    if (method === "p2p") this.recv_p2p++
    else if (method === "cdn") this.recv_cdn++
    var chunksSent = this.resourceRequester.p2pManager.swarm.chunksSent
    var stats = {chunksFromP2P: this.recv_p2p, chunksFromCDN: this.recv_cdn, chunksSent: chunksSent}
    this.triggerStats(stats)
  }

  triggerStats(metrics) {
    this.trigger('playback:p2phlsstats:add', metrics);
    this.trigger('playback:stats:add', metrics);
  }

  updateHighDefinition(isHD) {
    this.highDefinition = (isHD === "true");
    this.trigger('playback:highdefinitionupdate')
  }

  play() {
    super()
    if (!this.bufferLengthTimer) {
      this.bufferLengthTimer = setInterval(() => this.updateBufferLength(), 1000)
    }
  }

  updateBufferLength() {
    this.bufferLength = this.el.globoGetbufferLength() || 0
    this.triggerStats({bufferLength: this.bufferLength})
  }

  getAverageSegmentSize() {
    if (!this.avgSegmentSize || this.avgSegmentSize === 0 && this.getLevels().length > 0) {
      this.avgSegmentSize = Math.round(this.getLevels()[0].averageduration) || 0
    }
    return this.avgSegmentSize
  }

  toKB(num) {
    var bitrate = Math.floor(num/1000)
    return !_.isNaN(bitrate)?bitrate:"UNKNOWN"
  }
}

P2PHLS.canPlay = function(resource) {
  return !!(window.webkitRTCPeerConnection || window.mozRTCPeerConnection) && !!resource.match(/^http(.*).m3u8/)
}

module.exports = window.P2PHLS = P2PHLS;
