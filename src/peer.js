// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

var BaseObject = require('base_object');


class Peer extends BaseObject {
  initialize(params) {
    this.ident = params.ident
    this.dataChannel = params.dataChannel
    this.bufferedDataChannel = params.bufferedChannel
    this.addListeners()
  }

  addListeners() {
    this.bufferedDataChannel.on("data", (data) => this.messageReceived(data))
    this.dataChannel.onmessage = ((evt) => this.messageReceived(evt.data))
  }

 send(message, buffered=false) {
    if (buffered) {
      this.bufferedDataChannel.send(message)
    } else {
      this.dataChannel.send(message)
    }
  }

  messageReceived(data) {
    console.log("["+this.ident+"] sent me: " + data)
  }
}

module.exports = Peer
