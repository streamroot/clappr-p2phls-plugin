// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by Apache
// license that can be found in the LICENSE file.

// This module is responsible for sending subsegments
// of the same chunk in order to avoid overhead or stucks
// on javascript interpreter.

class FlashUploader {
  constructor() {
    this.MAX_SIZE = 65536
    this.readPosition = 0
    this.endPosition = 0
  }

  send(sendPartCallback, chunk, finishSendingCallback) {
    this.chunk = chunk
    this.currentChunkLength = chunk.length
    this.sendPartCallback = sendPartCallback
    this.finishCallback = finishSendingCallback
    window.uploader = this
    this.sendID = setInterval(this.sendChunk.bind(this), 0);
  }

  sendChunk() {
    if (this.currentChunkLength <= this.MAX_SIZE) {
      this.sendPartCallback(this.currentChunk)
      this.startDecoding()
    } else if (this.endPosition >= this.currentChunkLength) {
      this.startDecoding()
    } else {
      this.endPosition += this.MAX_SIZE
      this.sendPartCallback(this.chunk.slice(this.readPosition, this.endPosition))
      this.readPosition = this.endPosition
    }
  }

  startDecoding() {
    this.readPosition = 0
    this.endPosition = 0
    clearInterval(this.sendID)
    this.finishCallback()
  }
}

module.exports = FlashUploader
