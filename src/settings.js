// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a Apache
// license that can be found in the LICENSE file.

class Settings {
}

/* logging
Turn on/off logging on browser's console on
initialization. You can always turn on/off
by pressing ctrl+shift+a on your browser tab. */
Settings.logging = true

/* maxStorageChunks
Maximum size of the storage in number of chunks. */
Settings.maxStorageChunks = 10

/* maxPartners
The maximum number of partners one peer can handle.
Partners are used to be requested for video segments. */
Settings.maxPartners = 4

/* maxSwarmSize
Maximum number of peers on the swarm. When reach this
number, P2PManager will ignore new peers. */
Settings.maxSwarmSize = 50

/* maxUploadSlots
Maximum number of peers one can serve. */
Settings.maxUploadSlots = 4

/* uploadSlotTimeout
Time in milliseconds that a upload slot will be expired.
If a given downloader stops to request segments for
uploadSlotTimeout seconds, this slot will be emptied. */
Settings.uploadSlotTimeout = 20000

/* tracker
Place where your rtc-switchboard server is running */
Settings.tracker = 'http://server.bem.tv:8080'

/* lowBufferLength
Local buffer threshold in seconds in which the player
will try to use P2P. Smaller than that, player will
request chunks only for CDN. */
Settings.lowBufferLength = 5

/* points
How many points a partner win/loss when send a segment
or not. This serves to reorganize peers and promoting or
demoting then as partners. */
Settings.points = 10

/* stunServers
STUN servers used to match peers. */
Settings.stunServers = [
  {"url": "stun:stun.bem.tv:3478"},
  {"url": "stun:stun.l.google.com:19302"},
  {"url": "stun:stun1.l.google.com:19302"},
  {"url": "stun:stun2.l.google.com:19302"},
  {"url": "stun:stun3.l.google.com:19302"},
  {"url": "stun:stun4.l.google.com:19302"},
  {"url": "stun:stun.stunprotocol.org:3478"},
]

module.exports = Settings
