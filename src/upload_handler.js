// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a Apache
// license that can be found in the LICENSE file.

var BaseObject = require('base_object');
var Settings = require("./settings")
var _ = require("underscore")
var log = require('./log');

class UploadHandler extends BaseObject {
  constructor() {
    this.maxUploadSlots = Settings.maxUploadSlots
    this.slots = {}
    setInterval(this.checkAndFreeSlots.bind(this), 5000)
  }

  getSlot(peerId) {
    this.checkAndFreeSlots()
    if (_.contains(this.slots.keys, peerId) || this.hasFreeSlots()) {
      this.slots[peerId] = Date.now()
      this.trigger('uploadhandler:update', {occupiedSlots: _.size(this.slots), totalSlots: this.maxUploadSlots})
      return true
    } else {
      log.warn("don't have free upload slots")
      return false
    }
  }

  checkAndFreeSlots() {
    var threshold = Date.now() - Settings.uploadSlotTimeout
    _.each(this.slots, function (timestamp, peerId) {
      if (timestamp <= threshold) {
        log.warn("freeing upload slot")
        delete this.slots[peerId]
        this.trigger('uploadhandler:update', {occupiedSlots: _.size(this.slots), totalSlots: this.maxUploadSlots})
      }
    }, this)
  }

  hasFreeSlots() {
    log.info("has free slots?" +  (_.size(this.slots) < this.maxUploadSlots))
    return (_.size(this.slots) < this.maxUploadSlots)
  }
}

UploadHandler.getInstance = function() {
  if (this._instance === undefined) {
    this._instance = new this()
  }
  return this._instance
}

module.exports = UploadHandler
