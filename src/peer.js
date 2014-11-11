// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a Apache
// license that can be found in the LICENSE file.

var BaseObject = require('base_object');
var Storage = require('./storage');
var UploadHandler = require('./upload_handler')
var PlaybackInfo = require('./playback_info')
var log = require('./log').getInstance()

class Peer extends BaseObject {
  constructor(params) {
    this.storage = Storage.getInstance()
    this.ident = params.ident
    this.swarm = params.swarm
    this.dataChannel = params.dataChannel
    this.dataChannel.on("data", (data) => this.messageReceived(data))
    this.uploadHandler = UploadHandler.getInstance()
    this.playbackInfo = PlaybackInfo.getInstance()
    this.score = 1000
    this.late = 0
    this.active = false
    this.sendPing()
  }

  sendPing() {
    this.pingSent = Date.now()
    var msg = this.mountMessage("ping", "", (new Array(300*1024)).join("x"))
    this.dataChannel.send(msg)
  }

  sendPong() {
    var msg = this.mountMessage("pong", "", "")
    this.dataChannel.send(msg)
  }

  pongReceived() {
    var rtt = Date.now() - this.pingSent
    this.active = true
    this.score -= Math.ceil(rtt / 100)
    log.info('join: ' + this.ident + " (rtt: " + rtt + ")")
  }

  sendSatisfy(resource) {
    if (this.storage.contain(resource)) {
      if (this.uploadHandler.getSlot(this.ident)) {
        this.send('satisfy', resource, this.storage.getItem(resource))
        this.playbackInfo.updateChunkStats('p2psent')
      } else {
        log.warn("cannot send satisfy, no upload slot available")
        this.send("busy", resource)
      }
    } else {
      this.send('choke', resource)
    }
  }

  interestedReceived(resource) {
    if (this.storage.contain(resource)) {
      if (this.uploadHandler.getSlot(this.ident)) {
        this.send('contain', resource)
      } else {
        this.send('busy', resource)
      }
    } else {
      this.send("choke", resource)
    }
  }

  messageReceived(bundle) {
    var data = JSON.parse(bundle)
    switch (data.command) {
      case 'interested':
        this.interestedReceived(data.resource)
        break
      case 'contain':
        this.swarm.containReceived(this, data.resource)
        break
      case 'request':
        this.sendSatisfy(data.resource)
        break
      case 'choke':
        this.swarm.chokeReceived(data.resource)
        break
      case 'satisfy':
        if (data.content.length > 0) {
          log.info("received satisfy")
          this.swarm.satisfyReceived(this, data.resource, data.content)
        }
        break
      case 'busy':
        this.swarm.busyReceived(this)
        break
      case 'ping':
        this.sendPong()
        break
      case 'pong':
        this.pongReceived(this)
        break
    }
  }

  send(command, resource, content='') {
    var message = this.mountMessage(command, resource, content)
    this.dataChannel.send(message)
  }

  mountMessage(command, resource, content) {
    return JSON.stringify({"command": command, "resource": resource, "content": content || null})
  }
}

module.exports = Peer
