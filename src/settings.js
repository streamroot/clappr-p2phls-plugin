// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

class Settings {
}

/* maxStorageBytes
Maximum size of the storage in bytes. */
Settings.maxStorageChunks = 10

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

/* maxPartners
The maximum number of partners one peer can handle.
Partners are used to be requested for video segments. */
Settings.maxPartners = 4


/* points
How many points a partner win/loss when send a segment
or not. This serves to reorganize peers and promoting or
demoting then. */
Settings.points = 10

module.exports = Settings
