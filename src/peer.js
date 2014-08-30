// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a Apache
// license that can be found in the LICENSE file.

var BaseObject = require('base_object');
var Storage = require('./storage');
var UploadHandler = require('./upload_handler')
var log = require('./log');

class Peer extends BaseObject {
  initialize(params) {
    this.storage = Storage.getInstance()
    this.ident = params.ident
    this.swarm = params.swarm
    this.dataChannel = params.dataChannel
    this.dataChannel.on("data", (data) => this.messageReceived(data))
    this.uploadHandler = UploadHandler.getInstance()
    this.score = 1000
    this.sendPing()
  }

  sendPing() {
    this.pingSentTime = Date.now()
    this.dataChannel.send("ping$$")
  }

  sendPong() {
    this.dataChannel.send("pong$$")
  }

  calculateRTT() {
    this.rtt = Date.now() - this.pingSentTime
    log.debug(this.ident + ': ping?pong! rtt: ' + this.rtt)
  }

  send(command, resource, content='') {
    var message = this.mountMessage(command, resource, content)
    this.dataChannel.send(message)
  }

  sendSatisfy(resource) {
    if (this.uploadHandler.getSlot(this.ident)) {
      this.send('satisfy', resource, this.storage.getItem(resource))
      this.swarm.chunksSent += 1
    } else {
      log.warn("cannot send satisfy, no upload slot available")
    }
  }

  interestedReceived(resource) {
    if (this.storage.contain(resource) && this.uploadHandler.getSlot(this.ident)) {
      this.send("contain", resource)
    } else {
      this.send("choke", resource)
    }
  }

  messageReceived(data) {
    this.processMessage(data)
  }

  processMessage(data) {
    var [command, resource, content] = data.split("$")
    switch (command) {
      case 'interested':
        this.interestedReceived(resource)
        break
      case 'contain':
        this.swarm.containReceived(this.ident, resource)
        break
      case 'request':
        this.sendSatisfy(resource)
        break
      case 'choke':
        this.swarm.chokeReceived(resource)
        break
      case 'ping':
        this.sendPong()
        break
      case 'pong':
        this.calculateRTT()
        break
      case 'satisfy':
        log.debug('received _satisfy_')
        this.swarm.satisfyReceived(this.ident, resource, content)
        break
    }
  }

  mountMessage(command, resource, content) {
    var msg = command + "$" + resource + "$"
    if (content) {
      msg = msg + content
    }
    return msg
  }
}

module.exports = Peer
