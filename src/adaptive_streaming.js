// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a Apache
// license that can be found in the LICENSE file.

var BaseObject = require('base_object')
var log = require('./log').getInstance()

class AdaptiveStreaming extends BaseObject {
  constructor(main) {
    Clappr.Mediator.on(main.uniqueId + ':fragmentloaded', () => this.onFragmentLoaded())
    this.main = main
    this.info = this.main.playbackInfo.data
    this.currentLevel = 0
    this.threshold = 1.3
  }

  onFragmentLoaded() {
    this.maxLevel = this.info.levels.length - 1
    this.adjustLevel()
  }

  adjustLevel() {
    var currentBwNeeded = this.info.currentBitrate * this.threshold / 1000
    var nextBwNeeded = this.info.levels[this.currentLevel+1].bitrate * this.threshold / 1000

    if (this.info.bandwidth > nextBwNeeded && this.info.lastDownloadType === 'cdn' && this.currentLevel < this.maxLevel) {
      log.info("increasing level")
      this.currentLevel = this.currentLevel + 1
      this.changeLevel(this.currentLevel)
    } else if (this.info.bandwidth < currentBwNeeded) {
      log.info("decreasing level")
      this.currentLevel = this.currentLevel - 1
      this.changeLevel(this.currentLevel)
    } else {
      log.info("i'm ok, enjoying the ride. (curr bandwidth: " + this.info.bandwidth + ", nextBwNeeded:" + nextBwNeeded + ")")
    }
  }

  changeLevel(newLevel) {
    this.main.el.globoPlayerSmoothSetLevel(newLevel)
  }
}


module.exports = AdaptiveStreaming
