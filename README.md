# BemTV Plugin for Clappr Media Player

This plugin adds peer-to-peer powers for HTTP Live Streaming (HLS) transmissions on [Clappr Player](http://github.com/globocom/clappr).

![BemTV P2PHLS](http://bem.tv/static/bemtv_live_preview.png)

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

# Author

[Flávio Ribeiro](https://www.linkedin.com/in/flavioribeiro) (flavio@bem.tv)

![BemTV](http://bem.tv/static/bemtv_small_logo.png)
