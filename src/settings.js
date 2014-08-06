// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a Apache
// license that can be found in the LICENSE file.

class Settings {
}

/* maxStorageBytes
Maximum size of the storage in bytes. */
Settings.maxStorageChunks = 10

/* maxPartners
The maximum number of partners one peer can handle.
Partners are used to be requested for video segments. */
Settings.maxPartners = 4

/* maxUploadSlots
Maximum number of peers one can serve. */
Settings.maxUploadSlots = 4

/* uploadSlotTimeout
Time in milliseconds that a upload slot will be expired.
If a given downloader stops to request segments for 
uploadSlotTimeout seconds, this slot will be emptied. */
Settings.uploadSlotTimeout = 20000

/* tracker
Place where a rtc-switchboard server is running */
Settings.tracker = 'http://server.bem.tv:8080'

/* timeout
Time in seconds that the player will wait for peers to
send chunks. It should be a quarter of a segment size. */
Settings.timeout = 500 

/* lowBufferLength
Local buffer threshold in seconds in which the player
will try to use P2P. Smaller than that, player will
request chunks only for CDN. */
Settings.lowBufferLength = 5

/* points
How many points a partner win/loss when send a segment
or not. This serves to reorganize peers and promoting or
demoting then. */
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
