// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a Apache
// license that can be found in the LICENSE file.

var BaseObject = require('base_object');

var QuickConnect = require('rtc-quickconnect');
var Settings = require("./settings")
var Swarm = require('./swarm')
var log = require('./log');

class P2PManager extends BaseObject {
  initialize(params) {
    this.connectionSettings = {'room': params.swarm, iceServers: Settings.stunServers, debug: false}
    var tracker = params.tracker || Settings.tracker
    log.info("Initializing P2PManager with " + tracker)
    var connection = QuickConnect(tracker, this.connectionSettings)
    this.swarm = new Swarm()
    this.dataChannel = connection.createDataChannel('bemtv')
    this.setupListerners()
  }

  setupListerners() {
    this.dataChannel.on('channel:opened', (id, dataChannel) => this.onChannelOpened(id, dataChannel))
    this.dataChannel.on('channel:closed', (id, dataChannel) => this.onChannelClosed(id))
  }

  onChannelOpened(id, dataChannel) {
    if (this.swarm.size() <= Settings.maxSwarmSize) {
      this.swarm.addPeer(id, dataChannel);
    }
  }

  onChannelClosed(id) {
    this.swarm.removePeer(id);
  }

  requestResource(resource, callbackSuccess, callbackFail) {
    if (this.swarm.size() === 0) {
      callbackFail()
    } else {
      this.swarm.sendInterested(resource, callbackSuccess, callbackFail)
    }
  }
}

module.exports = P2PManager
