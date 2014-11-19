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
    var content = 'request=function(e,r,t){var n=new XMLHttpRequest;r&&(n.withCredentials=!0),n.open("GET",e,t?!0:!1),n.responseType="arraybuffer",n.onload=function(e){t(200===n.status?e.currentTarget.response:"")},n.send()},base64ArrayBuffer=function(e){for(var r,t,n,s,a,o="",u="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",i=new Uint8Array(e),d=i.byteLength,f=d%3,c=d-f,p=0;c>p;p+=3)a=i[p]<<16|i[p+1]<<8|i[p+2],r=(16515072&a)>>18,t=(258048&a)>>12,n=(4032&a)>>6,s=63&a,o+=u[r]+u[t]+u[n]+u[s];return 1==f?(a=i[c],r=(252&a)>>2,t=(3&a)<<4,o+=u[r]+u[t]+"=="):2==f&&(a=i[c]<<8|i[c+1],r=(64512&a)>>10,t=(1008&a)>>4,n=(15&a)<<2,o+=u[r]+u[t]+u[n]+"="),o},resourceLoaded=function(e){var e=base64ArrayBuffer(e);this.postMessage(e)},this.addEventListener("message",function(e){var r=JSON.parse(e.data);request(r.url,r.allowCredentials,resourceLoaded.bind(this))},!1);'
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
