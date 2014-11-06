// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a Apache
// license that can be found in the LICENSE file.

module.exports = {
  /* logging
  Turn on/off logging on browser's console on
  initialization. You can always turn on/off
  by pressing ctrl+shift+l on your browser tab. */
  logging: true,

  /* maxStorageChunks
  Maximum size of the storage in number of chunks. */
  maxStorageChunks: 10,

  /* maxContributors
  The maximum number of contributors one peer can handle.
  Contributors are used to be requested for video segments. */
  maxContributors: 10,

  /* maxSwarmSize
  Maximum number of peers on our particular swarm view.
  When reach this number, P2PManager will ignore new peers. */
  maxSwarmSize: 100,

  /* maxUploadSlots
  Maximum number of peers one can serve. */
  maxUploadSlots: 10,

  /* uploadSlotTimeout
  Time in milliseconds in which an upload slot will be expired.
  If a given downloader stops to request segments for
  uploadSlotTimeout seconds, this slot will be emptied. */
  uploadSlotTimeout: 8000,

  /* tracker
  Place where your rtc-switchboard server is running */
  tracker: 'http://tracker.bem.tv',

  /* lowBufferLength
  Local buffer threshold in seconds in which the player
  will try to use P2P. Smaller than lowBufferLength, player will
  request chunks only for CDN. */
  lowBufferLength: 5,

  /* points
  How many points a contributor win/loss when send a segment
  or not. This serves to reorganize peers and promoting or
  demoting then as contributors. */
  points: 1,

  /* stunServers
  STUN servers used to match peers. */
  stunServers: [
    {"url": "stun:stun.bem.tv:3478"},
    {"url": "stun:stun.l.google.com:19302"},
    {"url": "stun:stun1.l.google.com:19302"},
    {"url": "stun:stun2.l.google.com:19302"},
    {"url": "stun:stun3.l.google.com:19302"},
    {"url": "stun:stun4.l.google.com:19302"},
    {"url": "stun:stun.stunprotocol.org:3478"},
  ],

  /* forceAllowCredentials
  Some HLS servers use cookies to authenticate and create user
  sessions. This option enables BemTV to make requests to CDN
  using the cookies received when getting the master playlist. */
  forceAllowCredentials: false
}
