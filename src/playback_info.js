// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a Apache
// license that can be found in the LICENSE file.

var BaseObject = require('base_object')
var _ = require('underscore')

class PlaybackInfo extends BaseObject {
  constructor() {
    this.data = {}
  }

  setMain(main) {
    this.main = main
    this.data.delay = this.main.el.getDelay()
    this.listenTo(this.main, 'playback:stats:add', (metrics) => this.addData(metrics))
  }

  addData(metrics) {
    this.data = _.extend(this.data, metrics)
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
}

PlaybackInfo.getInstance = function() {
  if (this._instance === undefined) {
    this._instance = new this()
  }
  return this._instance
}

module.exports = PlaybackInfo
