# BemTV Plugin for Clappr Media Player

[![Build Status](https://travis-ci.org/bemtv/clappr-p2phls-plugin.svg?branch=master)](https://travis-ci.org/bemtv/clappr-p2phls-plugin)
[![Coverage Status](https://img.shields.io/coveralls/bemtv/clappr-p2phls-plugin.svg)](https://coveralls.io/r/bemtv/clappr-p2phls-plugin)
[![bemtv google group](http://img.shields.io/badge/discuss-bemtv-blue.svg)](https://groups.google.com/forum/#!forum/bemtv)
[![Issue Stats](http://issuestats.com/github/bemtv/clappr-p2phls-plugin/badge/issue)](http://issuestats.com/github/bemtv/clappr-p2phls-plugin)

This plugin adds peer-to-peer powers for HTTP Live Streaming (HLS) transmissions on [Clappr Player](http://github.com/globocom/clappr).

![BemTV P2PHLS](https://cloud.githubusercontent.com/assets/244265/4802042/33f02800-5e3d-11e4-8a82-50bd3af76526.png)

# Try it now!

Visit [BemTV](http://bem.tv) with a [modern browser](http://caniuse.com/#search=webrtc) and try it by yourself. 

# How to Use

```html
<head>
  <script src="http://cdn.clappr.io/bemtv/latest/p2phls.min.js"></script>
  <script src="http://cdn.clappr.io/bemtv/latest/p2phlsstats.min.js"></script>
</head>
<body>
  <div id="player-wrapper"></div>
  <script>
    var playerElement = document.getElementById("player-wrapper");
    var player = new Clappr.Player({
        source: 'http://cdn.bem.tv/stream/soccer5/playlist.m3u8',
        plugins: { playback: [P2PHLS], container: [P2PHLSStats] },
        poster: "http://cdn2.theinertia.com/wp-content/uploads/2012/05/Medina-Final.jpg",
        watermark: "http://bem.tv/assets/watermark3.png"
    });      
    player.attachTo(playerElement);
  </script>
</body>
```

# Questions/Support?

Post your question at our Google Groups discussion list: https://groups.google.com/d/forum/bemtv

# Contribute

If you'd like to support the development of this project, consider make a donation.

[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=BWQTD9JLRTNF6&lc=BR&item_name=BemTV%20CDN%2fP2P%20Architecture%20for%20HLS%20Broadcasts&item_number=bemtv&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donate_LG%2egif%3aNonHosted)


# Author

[Flávio Ribeiro](https://www.linkedin.com/in/flavioribeiro) (flavio@bem.tv)

![BemTV](http://bem.tv/static/bemtv_small_logo.png)
