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
    this.threshold = 1.2
  }

  onFragmentLoaded() {
    this.adjustLevel()
  }

  adjustLevel() {
    var idealLevel = this.calculateIdealLevel()
    if (this.info.lastDownloadType === 'cdn' && this.currentLevel !== idealLevel) {
      log.info("Changing level: " + this.currentLevel + ' (' + this.info.currentBitrate + "Kbps) -> " + idealLevel + ' (' + this.info.levels[idealLevel].bitrate/1000 + "Kbps)")
      this.changeLevel(idealLevel)
    }
  }

  calculateIdealLevel() {
    var idealLevel = 0
    for (var i = 0; i < this.info.levels.length; i++) {
      var bitrate = this.info.levels[i].bitrate
      var bwNeeded = bitrate * this.threshold / 1000
      if (this.info.bandwidth > bwNeeded && bitrate < 1500000) {
        idealLevel = i
      }
    }
    return idealLevel
  }

  changeLevel(newLevel) {
    this.currentLevel = newLevel
    this.main.el.globoPlayerSmoothSetLevel(newLevel)
  }
}


module.exports = AdaptiveStreaming
