// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

var UIPlugin = require('ui_plugin');
var JST = require('./jst');
var Styler = require('./styler');
var _ = require('underscore');

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
    this.highDefinition = false
    this.autoPlay = options.autoPlay
    this.defaultSettings = {
      left: ["playstop", "volume"],
      default: [],
      right: ["fullscreen", "hd"]
    }
    this.settings = _.extend({}, this.defaultSettings)
    this.addListeners()
    this.resourceRequester = new ResourceRequester()
  }

  getSource(source) {
    return source.replace("p2phttp", "http")
  }

  setupBrowser() {
    this.isChrome = navigator.userAgent.match(/chrome/i)
    this.isFirefox = navigator.userAgent.match(/firefox/i)
  }

  requestResource(url) {
    this.chunksHandler.requestResource(url, (chunk) => this.resourceLoaded(chunk))
  }

  resourceLoaded(chunk) {
    this.el.resourceLoaded(chunk)
    return
  }

  addListeners() {
    WP3.Mediator.on(this.uniqueId + ':flashready', () => this.bootstrap())
    WP3.Mediator.on(this.uniqueId + ':timeupdate', (params) => this.updateTime(params))
    WP3.Mediator.on(this.uniqueId + ':playbackstate', (state) => this.setPlaybackState(state))
    WP3.Mediator.on(this.uniqueId + ':highdefinition', (isHD) => this.updateHighDefinition(isHD))
    WP3.Mediator.on(this.uniqueId + ':requestresource', (url) => this.requestResource(url))
  }

  stopListening() {
    super()
    WP3.Mediator.off(this.uniqueId + ':flashready')
    WP3.Mediator.off(this.uniqueId + ':timeupdate')
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
  }

  updateHighDefinition(isHD) {
    this.highDefinition = (isHD === "true");
    this.trigger('playback:highdefinitionupdate')
  }

  updateTime(params) {
    var duration, position = params.split(",")
    var previousDvrEnabled = this.dvrEnabled
    this.dvrEnabled = (this.playbackType === 'live' && duration > 240)
    var duration = this.getDuration()
    if (this.playbackType === 'live') {
      if (position >= duration) {
        position = duration
      }
      this.trigger('playback:timeupdate', position, duration, this.name)
    } else {
      this.trigger('playback:timeupdate', this.el.globoGetPosition(), duration, this.name)
    }
    if (this.dvrEnabled != previousDvrEnabled) {
      this.updateSettings()
    }
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

  getDuration() {
    var duration = this.el.globoGetDuration()
    if (this.playbackType === 'live') {
      // estimate 10 seconds of buffer time for live streams for seek positions
      duration = duration - 10
    }
    return duration
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
}

P2PHLS.canPlay = function(resource) {
  var isLegacyIE = window.ActiveXObject
  return (!isLegacyIE) && !!resource.match("p2phttp:(.*)")
}

module.exports = window.P2PHLS = P2PHLS;
