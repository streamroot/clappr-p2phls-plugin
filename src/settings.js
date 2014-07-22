// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

class Settings {
}

Settings.maxStorageBytes = 5 * 1024 * 1024 // 5 megabytes
Settings.swarm = 'bemtv-swarm'
Settings.tracker = 'http://server.bem.tv:8080'
Settings.timeout = 2000

module.exports = Settings
