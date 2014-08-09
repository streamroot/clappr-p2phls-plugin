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
    this.uploadHandler = new UploadHandler()
    this.active = true
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

  calculateRTT(command) {
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
    log.debug('received _' + command + '_')
    if (command === 'interested') {
      this.interestedReceived(resource)
    } else if (command === "contain") {
      log.debug("_contain_ received from " + this.ident)
      this.swarm.addSatisfyCandidate(this.ident, resource)
    } else if (command === 'request') {
      log.debug("_request_ received from " + this.ident)
      this.sendSatisfy(resource)
    } else if (command === 'choke') {
      this.swarm.chokeReceived(resource)
    } else if (command === 'ping') {
      this.sendPong()
    } else if (command === 'pong') {
      this.calculateRTT()
    } else if (command === 'satisfy') {
      log.debug("_satisfy_ received from " + this.ident)
      this.swarm.resourceReceived(this.ident, resource, content)
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
