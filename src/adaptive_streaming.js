// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a Apache
// license that can be found in the LICENSE file.

var BaseObject = require('base_object')
var log = require('./log')

class AdaptiveStreaming extends BaseObject {
  constructor(main) {
    Clappr.Mediator.on(main.uniqueId + ':fragmentloaded', () => this.onFragmentLoaded())
    this.main = main
    this.info = this.main.playbackInfo.data
    this.currentLevel = 0
  }

  onFragmentLoaded() {
    this.maxLevel = this.info.levels.length - 1
    if (this.currentBitrate < this.maxLevel) {
      this.adjustLevel()
    }
  }

  adjustLevel() {
    var currentBwNeeded = this.info.currentBitrate * this.info.segmentSize * 0.3
    var nextBwNeeded = this.info.levels[this.currentLevel+1].bitrate * this.info.segmentSize * 0.3

    if (this.info.bandwidth > nextBwNeeded && this.info.lastDownloadType === 'cdn') {
      log.info("[mbr] increasing level")
      this.currentLevel = this.currentLevel + 1
    } else if (this.info.bandwidth < currentBwNeeded) {
      log.info("[mbr] decreasing level")
      this.currentLevel = this.currentLevel - 1
    }
    this.changeLevel(this.currentLevel)
  }

  changeLevel(newLevel) {
    this.main.el.globoPlayerSmoothSetLevel(newLevel)
  }
}


module.exports = AdaptiveStreaming
