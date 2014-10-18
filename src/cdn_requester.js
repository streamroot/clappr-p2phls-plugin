// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by Apache
// license that can be found in the LICENSE file.

var BaseObject = require('base_object')
var Storage = require('./storage')
var Settings = require('./settings')

class CDNRequester extends BaseObject {
  get name() { return 'CDNRequester' }
  constructor() {
    this.storage = Storage.getInstance()
    this.utils = new Worker(this.getWorkerURL())
    this.utils.onmessage = (e) => this.resourceLoaded(e.data)
  }

  getWorkerURL() {
    var content = 'request=function(e,r,s,n){var t=new XMLHttpRequest;return r&&(t.withCredentials=!0),t.open("GET",e,s?!0:!1),n&&(t.responseType=n),s?(t.onload=s,void t.send()):(t.send(),200==t.status?t.response:"")},base64ArrayBuffer=function(e){for(var r,s,n,t,a,o="",u="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",d=new Uint8Array(e),i=d.byteLength,f=i%3,l=i-f,p=0;l>p;p+=3)a=d[p]<<16|d[p+1]<<8|d[p+2],r=(16515072&a)>>18,s=(258048&a)>>12,n=(4032&a)>>6,t=63&a,o+=u[r]+u[s]+u[n]+u[t];return 1==f?(a=d[l],r=(252&a)>>2,s=(3&a)<<4,o+=u[r]+u[s]+"=="):2==f&&(a=d[l]<<8|d[l+1],r=(64512&a)>>10,s=(1008&a)>>4,n=(15&a)<<2,o+=u[r]+u[s]+u[n]+"="),o},resourceLoaded=function(e){var r=base64ArrayBuffer(e.currentTarget.response);this.postMessage(r)},this.addEventListener("message",function(e){var r=JSON.parse(e.data);request(r.url,r.allowCredentials,resourceLoaded.bind(this),"arraybuffer")},!1);'
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
    this.storage.setItem(this.resource, chunk)
    var downloadTime = Date.now() - this.startRequest
    this.trigger('cdnrequester:downloadtime', {downloadTime: downloadTime, type: 'cdn'})
    this.callback(chunk, "cdn");
  }
}

module.exports = CDNRequester;
