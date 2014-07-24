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
    this.bufferedDataChannel.on("data", (data) => this.bufferedMessageReceived(data))
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

  bufferedMessageReceived(evt) {
    console.log('buffered stored on window.evt')
    console.log(evt.data.length)
    window.evt = evt
    this.processMessage(evt.data)
  }

  messageReceived(data) {
    this.processMessage(data)
  }

  processMessage(data) {
    var [command, resource, content] = data.split("$")
    if (command === 'desire' && this.storage.has(resource)) {
      this.send("has", resource)
    } else if (command === "has") {
      this.swarm.addSatisfyCandidate(this.ident, resource)
    } else if (command === 'request') {
      console.log('received request')
      this.send('satisfy', resource, this.storage.getItem(resource), true)
    } else if (command === 'satisfy') {
      this.swarm.resourceReceived(this.ident, content)
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
