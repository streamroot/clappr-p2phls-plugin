// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

var BaseObject = require('base_object');

var BufferedChannel = require('rtc-bufferedchannel');
var Freeice = require('freeice');
var QuickConnect = require('rtc-quickconnect');
var Settings = require("./settings")

class P2PManager extends BaseObject {
  initialize() {
    this.connectionSettings = {'room': Settings.swarm, iceServers: Freeice(), debug: false}
    this.connection = QuickConnect(Settings.tracker, this.connectionSettings)
    //TODO create different data channels for different protocol messages
    this.dataChannel = this.connection.createDataChannel(Settings.swarm)
    this.setupConnectionListeners()
  }

  setupConnectionListeners() {
    this.dataChannel.on('channel:opened', (id, dataChannel) => this.onChannelOpened(id, dataChannel))
    this.dataChannel.on('channel:closed', (id, dataChannel) => this.onChannelOpened(id, dataChannel))
  }

  onChannelOpened(id, dataChannel) {
    console.log("Id " + id + " has joined the transmission")
  }
}

module.exports = P2PManager
