// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by Apache
// license that can be found in the LICENSE file.

var UIPlugin = require('ui_plugin');
var Browser = require('browser');
var JST = require('./jst');
var Styler = require('./styler');
var _ = require('underscore');

var log = require('./log');
var Settings = require('./settings');
var ResourceRequester = require('./resource_requester');
var UploadHandler = require('./upload_handler');


class P2PHLS extends UIPlugin {
  get name() { return 'p2phls'; }
  get tagName() { return 'object' }
  get template() { return JST.p2phls }
  get attributes() {
    return {
      'data-p2phls': '',
      'type': 'application/x-shockwave-flash'
    }
  }

  constructor(options) {
    super(options)
    this.options = options
    this.src = options.src
    this.swfPath = "assets/P2PHLSPlayer.swf"
    this.createResourceRequester()
    this.highDefinition = false
    this.autoPlay = options.autoPlay
    this.defaultSettings = {left: ["playstop", "volume"], default: [], right: ["fullscreen", "hd"]}
    this.settings = _.extend({}, this.defaultSettings)
    this.uploadHandler = UploadHandler.getInstance()
    this.addListeners()
  }

  addListeners() {
    Clappr.Mediator.on(this.uniqueId + ':flashready', () => this.bootstrap())
    Clappr.Mediator.on(this.uniqueId + ':playbackstate', (state) => this.setPlaybackState(state))
    Clappr.Mediator.on(this.uniqueId + ':highdefinition', (isHD) => this.updateHighDefinition(isHD))
    Clappr.Mediator.on(this.uniqueId + ':requestresource', (url) => this.requestResource(url))
    this.listenTo(this.resourceRequester.p2pManager.swarm, "swarm:sizeupdate", (event) => this.triggerStats(event))
    this.listenTo(this.uploadHandler, 'uploadhandler:update', (event) => this.triggerStats(event))
  }

  createResourceRequester() {
    var requesterOptions = {
      currentState: this.getCurrentState.bind(this),
      swarm: btoa(this.src),
      tracker: this.options.bemtvTracker
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

  stopListening() {
    super()
    Clappr.Mediator.off(this.uniqueId + ':flashready')
    Clappr.Mediator.off(this.uniqueId + ':playbackstate')
    Clappr.Mediator.off(this.uniqueId + ':highdefinition')
  }

  hiddenCallback() {
    this.hiddenId = setTimeout(() => this.el.globoPlayerSmoothSetLevel(0), 10000)
  }

  visibleCallback() {
    if (this.hiddenId) {
      clearTimeout(this.hiddenId)
    }
    if (!this.el.globoGetAutoLevel()) {
      this.el.globoPlayerSmoothSetLevel(-1)
    }
  }

  bootstrap() {
    this.el.width = "100%"
    this.el.height = "100%"
    this.currentState = "IDLE"
    this.el.playerSetminBufferLength(6)
    this.el.playerSetlowBufferLength(Settings.lowBufferLength)
    this.recv_cdn = 0
    this.recv_p2p = 0
    this.bufferLength = 0
    this.updateStats()
    this.triggerStats({status: "on"})
    this.autoPlay && this.play()
    this.ready = true
    this.trigger('playback:ready', this.name)
  }

  updateBufferLength() {
    this.bufferLength = this.el.globoGetbufferLength() || 0
    this.triggerStats({bufferLength: this.bufferLength})
    if (this.bufferLength < 1 && this.currentState === 'PLAYING') {
      this.setPlaybackState('PLAYING_BUFFERING')
    } else if (this.bufferLength > 1 && this.currentState === "PLAYING_BUFFERING") {
      this.setPlaybackState('PLAYING')
    }
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
    if (this.el.currentState === 'PAUSED') {
      this.el.globoPlayerResume()
    } else {
      this.firstPlay()
      this.bufferLengthTimer = setInterval(() => this.updateBufferLength(), 500)
    }
    this.trigger('playback:play', this.name)
  }

  getPlaybackType() {
    return this.playbackType? this.playbackType: null;
  }

  getCurrentBitrate() {
    var currentLevel = this.getLevels()[this.el.globoGetLevel()]
    return currentLevel.bitrate
  }

  getAverageSegmentSize() {
    if (!this.avgSegmentSize || this.avgSegmentSize === 0 && this.getLevels().length > 0) {
      this.avgSegmentSize = Math.round(this.getLevels()[0].averageduration) || 0
    }
    return this.avgSegmentSize || 0
  }

  isHighDefinitionInUse() {
    return this.highDefinition
  }

  getLevels() {
    if (!this.levels || this.levels.length === 0) {
      this.levels = this.el.globoGetLevels()
    }
    return this.levels
  }

  setPlaybackState(state) {
    if (state === "PLAYING_BUFFERING" && this.bufferLength < 1)  {
      this.trigger('playback:buffering', this.name)
    } else if (state === "PLAYING" && this.currentState === "PLAYING_BUFFERING") {
      this.trigger('playback:bufferfull', this.name)
      if (this.resourceRequester.isInitialBuffer) {
        this.resourceRequester.isInitialBuffer = false
      }
    } else if (state === "IDLE") {
      this.trigger('playback:ended', this.name)
      this.trigger('playback:timeupdate', 0, this.el.globoGetDuration(), this.name)
    }
    this.currentState = state;
    this.triggerStats({state: this.currentState, currentBitrate: this.toKB(this.getCurrentBitrate())})
    this.updatePlaybackType()
  }

  updatePlaybackType() {
    if (!this.playbackType) {
      this.playbackType = this.el.globoGetType()
      if (this.playbackType) {
        this.playbackType = this.playbackType.toLowerCase()
        this.updateSettings()
      }
    }
  }

  firstPlay() {
    this.el.globoPlayerLoad(this.src)
    this.el.globoPlayerPlay()
  }

  volume(value) {
    this.el.globoPlayerVolume(value)
  }

  pause() {
    this.el.globoPlayerPause()
  }

  stop() {
    this.el.globoPlayerStop()
    this.trigger('playback:timeupdate', 0, this.name)
  }

  isPlaying() {
    if (this.currentState) {
      return !!(this.currentState.match(/playing/i))
    }
    return false
  }

  getCurrentState() {
    return this.currentState
  }

  getDuration() {
    if (!!this.duration) {
      this.duration = this.el.globoGetDuration()
    }
    return this.duration
  }

  seek(time) {
    if (time < 0) {
      this.el.globoPlayerSeek(time)
    } else {
      var duration = this.getDuration()
      time = duration * time / 100
      // seek operations to a time within 2 seconds from live stream will position playhead back to live
      if (this.playbackType === 'live' && duration - time < 2)
        time = -1
      this.el.globoPlayerSeek(time)
    }
  }

  timeUpdate(time, duration) {
    this.trigger('playback:timeupdate', time, duration, this.name)
  }

  destroy() {
    this.stopListening()
    this.$el.remove()
  }

  setupFirefox() {
    var $el = this.$('embed')
    $el.attr('data-hls', '')
    this.setElement($el[0])
  }

  updateSettings() {
    this.settings = _.extend({}, this.defaultSettings)
    if (this.playbackType === "vod" || this.dvrEnabled) {
      this.settings.left = ["playpause", "position", "duration"]
      this.settings.default = ["seekbar"]
    }
    this.trigger('playback:settingsupdate', this.name)
  }

  render() {
    var style = Styler.getStyleFor(this.name)
    this.$el.html(this.template({cid: this.cid, swfPath: this.swfPath, playbackId: this.uniqueId}))
    this.$el.append(style)
    this.el.id = this.cid
    if (Browser.isFirefox) {
      this.setupFirefox()
    }
    return this
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
