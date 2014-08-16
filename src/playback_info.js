// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by Apache
// license that can be found in the LICENSE file.

class PlaybackInfo {
  constructor() {
    this.info = {}
  }

  add(key, value) {
    this.info[key] = value
  }

  get(key) {
    return this.info[key] || undefined
  }
}

PlaybackInfo.getInstance = function() {
  if (this._instance == undefined) {
    this._instance = new this();
  }
  return this._instance;
}

module.exports = PlaybackInfo

