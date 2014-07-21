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
  initialize() {
    this.connectionSettings = {'room': Settings.swarm, iceServers: Freeice(), debug: false}
    this.connection = QuickConnect(Settings.tracker, this.connectionSettings)
    this.swarm = new Swarm()

    //TODO create different data channels for different protocol messages
    this.dataChannel = this.connection.createDataChannel(Settings.swarm)
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

  requestResource(requester, resource, callbackSuccess, callbackFail) {
    if (this.swarm.size() === 0) {
      callbackFail.apply(requester)
    } else {
      callbackFail.apply(requester)
      this.swarm.sendTo('partners', 'desire', resource)
    }
  }

  sendTo(recipients, command, resource) {
    /* recipients: all, partners or peer ident
       command: desire, contain, request, satisfy */
    this.swarm.sendTo(recipients, command, resource)
  }
}

module.exports = P2PManager
