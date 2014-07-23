// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

class Settings {
}

/* maxStorageBytes
Maximum size of the storage in bytes. */
Settings.maxStorageBytes = 5 * 1024 * 1024

/* swarm
Name of the swarm where peers converge. */
Settings.swarm = 'bemtv-swarm'

/* tracker
Place where a rtc-switchboard server is running */
Settings.tracker = 'http://server.bem.tv:8080'

/* timeout
Time in seconds that the player will wait for peers to
send chunks. */
Settings.timeout = 2000

/* lowBufferLength
Local buffer threshold in seconds in which the player
will try to use P2P. Smaller than that, player will
behave as a normal one. */
Settings.lowBufferLength = 5

module.exports = Settings
