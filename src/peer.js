// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

var BaseObject = require('base_object');
var Storage = require('./storage');


class Peer extends BaseObject {
  initialize(params) {
    this.ident = params.ident
    this.dataChannel = params.dataChannel
    this.bufferedDataChannel = params.bufferedChannel
    this.swarm = params.swarm
    this.storage = Storage.getInstance()
    this.addListeners()
  }

  addListeners() {
    this.bufferedDataChannel.on("data", (data) => this.messageReceived(data))
    this.dataChannel.onmessage = ((evt) => this.messageReceived(evt.data))
  }

 send(command, resource, content='', buffered=false) {
    var message = this.mountMessage(command, resource, content)
    if (buffered) {
      this.bufferedDataChannel.send(message)
    } else {
      this.dataChannel.send(message)
    }
  }

  messageReceived(data) {
    this.processMessage(data)
  }

  processMessage(data) {
    var [command, resource, content] = data.split("$")
    if (command === 'desire' && this.storage.has(resource)) {
      this.send("has", resource)
    } else if (command === "has") {
      this.swarm.addCandidateForResource(this.ident, resource)
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
