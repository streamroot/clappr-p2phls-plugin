// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

var UIPlugin = require('ui_plugin');
var JST = require('./jst');
var Styler = require('./styler');
var _ = require('underscore');

var Settings = ('./settings');
var ResourceRequester = require('./resource_requester');


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

  initialize(options) {
    super(options)
    this.src = this.getSource(options.src)
    this.swfPath = "assets/P2PHLSPlayer.swf"
    this.setupBrowser()
    this.createResourceRequester()
    this.highDefinition = false
    this.autoPlay = options.autoPlay
    this.defaultSettings = {left: ["playstop", "volume"], default: [], right: ["fullscreen", "hd"]}
    this.settings = _.extend({}, this.defaultSettings)
    this.addListeners()
  }

  createResourceRequester() {
    var requesterOptions = {currentState: this.getCurrentState.bind(this), swarm: btoa(this.src)}
    this.resourceRequester = new ResourceRequester(requesterOptions)
  }

  getSource(source) {
    return source.replace("p2p+http", "http")
  }

  setupBrowser() {
    this.isChrome = navigator.userAgent.match(/chrome/i)
    this.isFirefox = navigator.userAgent.match(/firefox/i)
  }

  requestResource(url) {
    this.currentUrl = url
    this.resourceRequester.requestResource(url, (chunk, method) => this.resourceLoaded(chunk, method))
  }

  resourceLoaded(chunk, method) {
    if (this.currentUrl) {
      this.currentUrl = null
      this.el.resourceLoaded(chunk)
      this.updateStats(method)
    } else {
      console.log("It seems a deadlock happened with timers on swarm.")
    }
  }

  updateStats(method=null) {
    if (method == "p2p") this.recv_p2p++
    else if (method == "cdn") this.recv_cdn++
    var swarmSize = this.resourceRequester.p2pManager.swarm.size()
    var chunksSent = this.resourceRequester.p2pManager.swarm.chunksSent
    var stats = {chunksFromP2P: this.recv_p2p, chunksFromCDN: this.recv_cdn,
                swarmSize: swarmSize, chunksSent: chunksSent}
    this.triggerStats(stats)
  }

  addListeners() {
    WP3.Mediator.on(this.uniqueId + ':flashready', () => this.bootstrap())
    WP3.Mediator.on(this.uniqueId + ':playbackstate', (state) => this.setPlaybackState(state))
    WP3.Mediator.on(this.uniqueId + ':highdefinition', (isHD) => this.updateHighDefinition(isHD))
    WP3.Mediator.on(this.uniqueId + ':requestresource', (url) => this.requestResource(url))
  }

  stopListening() {
    super()
    WP3.Mediator.off(this.uniqueId + ':flashready')
    WP3.Mediator.off(this.uniqueId + ':playbackstate')
    WP3.Mediator.off(this.uniqueId + ':highdefinition')
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
    this.trigger('playback:ready', this.name)
    this.currentState = "IDLE"
    this.autoPlay && this.play()
    this.ready = true
    this.el.playerSetminBufferLength(10)
    this.el.playerSetlowBufferLength(Settings.lowBufferLength)
    this.recv_cdn = 0
    this.recv_p2p = 0
    this.updateStats()
    this.triggerStats({status: "on"});
    this.bufferLengthTimer = setInterval(() => this.updateBufferLength(), 500)
  }

  updateBufferLength() {
    var bufferLength = this.el.globoGetbufferLength() || 0
    this.triggerStats({bufferLength: bufferLength})
  }

  triggerStats(metrics) {
    this.trigger('playback:p2phlsstats:add', metrics);
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

  getLastProgramDate() {
    var programDate = this.el.globoGetLastProgramDate()
    // normalizing for BRT
    return programDate - 1.08e+7
  }

  isHighDefinition() {
    return this.highDefinition
  }

  getLevels() {
    if (!this.levels || this.levels.length === 0) {
      this.levels = this.el.globoGetLevels()
    }
    return this.levels
  }

  setPlaybackState(state) {
    if (state === "PLAYING_BUFFERING" && this.el.globoGetbufferLength() < 1 && this.currentState !== "PLAYING_BUFFERING")  {
      this.trigger('playback:buffering', this.name)
    } else if (state === "PLAYING" && this.currentState === "PLAYING_BUFFERING") {
      this.trigger('playback:bufferfull', this.name)
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
    if(this.isFirefox) { //FIXME remove it from here
      this.setupFirefox()
    }
    return this
  }

  toKB(num) {
    return Math.floor(num/1000)
  }
}

P2PHLS.canPlay = function(resource) {
  return !!(window.webkitRTCPeerConnection || window.mozRTCPeerConnection) && !!resource.match("p2p\\+http:(.*)")
}

module.exports = window.P2PHLS = P2PHLS;
