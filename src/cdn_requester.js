// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by Apache
// license that can be found in the LICENSE file.

var BaseObject = require('base_object')
var Settings = require('./settings')
var log = require('./log').getInstance()

class CDNRequester extends BaseObject {
  get name() { return 'CDNRequester' }
  constructor() {
    this.utils = new Worker(this.getWorkerURL())
    this.utils.onmessage = (e) => this.resourceLoaded(e.data)
  }

  getWorkerURL() {
    // non-minified version at https://gist.github.com/flavioribeiro/d706afbf83d055439f21
    var content = 'function add32(r,e){return r+e&4294967295}function cmn(r,e,n,f,i,t){return e=add32(add32(e,r),add32(f,t)),add32(e<<i|e>>>32-i,n)}function ff(r,e,n,f,i,t,h){return cmn(e&n|~e&f,r,e,i,t,h)}function gg(r,e,n,f,i,t,h){return cmn(e&f|n&~f,r,e,i,t,h)}function hh(r,e,n,f,i,t,h){return cmn(e^n^f,r,e,i,t,h)}function ii(r,e,n,f,i,t,h){return cmn(n^(e|~f),r,e,i,t,h)}function md5cycle(r,e){var n=r[0],f=r[1],i=r[2],t=r[3];n=ff(n,f,i,t,e[0],7,-680876936),t=ff(t,n,f,i,e[1],12,-389564586),i=ff(i,t,n,f,e[2],17,606105819),f=ff(f,i,t,n,e[3],22,-1044525330),n=ff(n,f,i,t,e[4],7,-176418897),t=ff(t,n,f,i,e[5],12,1200080426),i=ff(i,t,n,f,e[6],17,-1473231341),f=ff(f,i,t,n,e[7],22,-45705983),n=ff(n,f,i,t,e[8],7,1770035416),t=ff(t,n,f,i,e[9],12,-1958414417),i=ff(i,t,n,f,e[10],17,-42063),f=ff(f,i,t,n,e[11],22,-1990404162),n=ff(n,f,i,t,e[12],7,1804603682),t=ff(t,n,f,i,e[13],12,-40341101),i=ff(i,t,n,f,e[14],17,-1502002290),f=ff(f,i,t,n,e[15],22,1236535329),n=gg(n,f,i,t,e[1],5,-165796510),t=gg(t,n,f,i,e[6],9,-1069501632),i=gg(i,t,n,f,e[11],14,643717713),f=gg(f,i,t,n,e[0],20,-373897302),n=gg(n,f,i,t,e[5],5,-701558691),t=gg(t,n,f,i,e[10],9,38016083),i=gg(i,t,n,f,e[15],14,-660478335),f=gg(f,i,t,n,e[4],20,-405537848),n=gg(n,f,i,t,e[9],5,568446438),t=gg(t,n,f,i,e[14],9,-1019803690),i=gg(i,t,n,f,e[3],14,-187363961),f=gg(f,i,t,n,e[8],20,1163531501),n=gg(n,f,i,t,e[13],5,-1444681467),t=gg(t,n,f,i,e[2],9,-51403784),i=gg(i,t,n,f,e[7],14,1735328473),f=gg(f,i,t,n,e[12],20,-1926607734),n=hh(n,f,i,t,e[5],4,-378558),t=hh(t,n,f,i,e[8],11,-2022574463),i=hh(i,t,n,f,e[11],16,1839030562),f=hh(f,i,t,n,e[14],23,-35309556),n=hh(n,f,i,t,e[1],4,-1530992060),t=hh(t,n,f,i,e[4],11,1272893353),i=hh(i,t,n,f,e[7],16,-155497632),f=hh(f,i,t,n,e[10],23,-1094730640),n=hh(n,f,i,t,e[13],4,681279174),t=hh(t,n,f,i,e[0],11,-358537222),i=hh(i,t,n,f,e[3],16,-722521979),f=hh(f,i,t,n,e[6],23,76029189),n=hh(n,f,i,t,e[9],4,-640364487),t=hh(t,n,f,i,e[12],11,-421815835),i=hh(i,t,n,f,e[15],16,530742520),f=hh(f,i,t,n,e[2],23,-995338651),n=ii(n,f,i,t,e[0],6,-198630844),t=ii(t,n,f,i,e[7],10,1126891415),i=ii(i,t,n,f,e[14],15,-1416354905),f=ii(f,i,t,n,e[5],21,-57434055),n=ii(n,f,i,t,e[12],6,1700485571),t=ii(t,n,f,i,e[3],10,-1894986606),i=ii(i,t,n,f,e[10],15,-1051523),f=ii(f,i,t,n,e[1],21,-2054922799),n=ii(n,f,i,t,e[8],6,1873313359),t=ii(t,n,f,i,e[15],10,-30611744),i=ii(i,t,n,f,e[6],15,-1560198380),f=ii(f,i,t,n,e[13],21,1309151649),n=ii(n,f,i,t,e[4],6,-145523070),t=ii(t,n,f,i,e[11],10,-1120210379),i=ii(i,t,n,f,e[2],15,718787259),f=ii(f,i,t,n,e[9],21,-343485551),r[0]=add32(n,r[0]),r[1]=add32(f,r[1]),r[2]=add32(i,r[2]),r[3]=add32(t,r[3])}function md5blk(r){var e,n=[];for(e=0;64>e;e+=4)n[e>>2]=r.charCodeAt(e)+(r.charCodeAt(e+1)<<8)+(r.charCodeAt(e+2)<<16)+(r.charCodeAt(e+3)<<24);return n}function md51(r){var e,n=r.length,f=[1732584193,-271733879,-1732584194,271733878];for(e=64;e<=r.length;e+=64)md5cycle(f,md5blk(r.substring(e-64,e)));r=r.substring(e-64);var i=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];for(e=0;e<r.length;e++)i[e>>2]|=r.charCodeAt(e)<<(e%4<<3);if(i[e>>2]|=128<<(e%4<<3),e>55)for(md5cycle(f,i),e=0;16>e;e++)i[e]=0;return i[14]=8*n,md5cycle(f,i),f}function rhex(r){var e,n="";for(e=0;4>e;e++)n+=hex_chr[r>>8*e+4&15]+hex_chr[r>>8*e&15];return n}function hex(r){var e;for(e=0;e<r.length;e++)r[e]=rhex(r[e]);return r.join("")}function md5(r){return hex(md51(r))}request=function(r,e,n){var f=new XMLHttpRequest;e&&(f.withCredentials=!0),f.open("GET",r,!0),f.responseType="arraybuffer",f.onload=function(r){n(200===f.status?r.currentTarget.response:"")},f.send()},base64ArrayBuffer=function(r){for(var e,n,f,i,t,h="",a="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",d=new Uint8Array(r),g=d.byteLength,c=g%3,u=g-c,o=0;u>o;o+=3)t=d[o]<<16|d[o+1]<<8|d[o+2],e=(16515072&t)>>18,n=(258048&t)>>12,f=(4032&t)>>6,i=63&t,h+=a[e]+a[n]+a[f]+a[i];return 1==c?(t=d[u],e=(252&t)>>2,n=(3&t)<<4,h+=a[e]+a[n]+"=="):2==c&&(t=d[u]<<8|d[u+1],e=(64512&t)>>10,n=(1008&t)>>4,f=(15&t)<<2,h+=a[e]+a[n]+a[f]+"="),h},resourceLoaded=function(r){var r=base64ArrayBuffer(r),e=md5(r);this.postMessage(e+r)},this.addEventListener("message",function(r){var e=JSON.parse(r.data);request(e.url,e.allowCredentials,resourceLoaded.bind(this))},!1);var hex_chr=["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];'
    var blob
    try {
      blob = new Blob([content], {type: 'application/javascript'})
    } catch (e) {
      window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder
      blob = new BlobBuilder()
      blob.append(content)
      blob = blob.getBlob()
    }

    return URL.createObjectURL(blob)
  }

  requestResource(resource, callback) {
    this.callback = callback
    this.resource = resource
    var message = {'url':resource, 'allowCredentials': Settings.forceAllowCredentials}
    this.utils.postMessage(JSON.stringify(message))
    this.startRequest = Date.now()
  }

  resourceLoaded(chunk) {
    if (chunk.length === 0) {
      log.warn("error fetching from CDN, retrying")
      this.requestResource(this.resource, this.callback)
    } else {
      var downloadTime = Date.now() - this.startRequest
      this.trigger('cdnrequester:downloadtime', {downloadTime: downloadTime, type: 'cdn'})
      this.callback(chunk, "cdn");
    }
  }
}

module.exports = CDNRequester;
