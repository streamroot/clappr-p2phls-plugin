// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

var BaseObject = require('base_object');

var Freeice = require('freeice');
var QuickConnect = require('rtc-quickconnect');
var Settings = require("./settings")

var Swarm = require('./swarm')

class P2PManager extends BaseObject {
  initialize(params) {
    this.connectionSettings = {'room': params.swarm, iceServers: Freeice({stun:4}), debug: false}
    var connection = QuickConnect(Settings.tracker, this.connectionSettings)
    this.swarm = new Swarm()

    //TODO create different data channels for different protocol messages
    this.dataChannel = connection.createDataChannel('bemtv')
    this.setupListerners()
  }

  setupListerners() {
    this.dataChannel.on('channel:opened', (id, dataChannel) => this.onChannelOpened(id, dataChannel))
    this.dataChannel.on('channel:closed', (id, dataChannel) => this.onChannelClosed(id, dataChannel))
  }

  onChannelOpened(id, dataChannel) {
    this.swarm.addPeer(id, dataChannel);
  }

  onChannelClosed(id, dataChannel) {
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
