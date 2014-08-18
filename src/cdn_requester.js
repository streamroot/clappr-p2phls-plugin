// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by Apache
// license that can be found in the LICENSE file.

var BaseObject = require('base_object');
var Storage = require('./storage')

class CDNRequester extends BaseObject {
  get name() { return 'CDNRequester'; }
  initialize() {
    this.storage = Storage.getInstance()
    this.utils = new Worker(this.getWorkerURL())
    this.utils.onmessage = (e) => this.resourceLoaded(e.data)
  }

  getWorkerURL() {
    console.log("using getWorkerURL")
    var content = 'request=function(e,r,s){var n=new XMLHttpRequest;return n.open("GET",e,r?!0:!1),s&&(n.responseType=s),r?(n.onload=r,void n.send()):(n.send(),200==n.status?n.response:"")},base64ArrayBuffer=function(e){for(var r,s,n,t,a,o="",u="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",d=new Uint8Array(e),f=d.byteLength,i=f%3,c=f-i,p=0;c>p;p+=3)a=d[p]<<16|d[p+1]<<8|d[p+2],r=(16515072&a)>>18,s=(258048&a)>>12,n=(4032&a)>>6,t=63&a,o+=u[r]+u[s]+u[n]+u[t];return 1==i?(a=d[c],r=(252&a)>>2,s=(3&a)<<4,o+=u[r]+u[s]+"=="):2==i&&(a=d[c]<<8|d[c+1],r=(64512&a)>>10,s=(1008&a)>>4,n=(15&a)<<2,o+=u[r]+u[s]+u[n]+"="),o},resourceLoaded=function(e){var r=base64ArrayBuffer(e.currentTarget.response);this.postMessage(r)},this.addEventListener("message",function(e){request(e.data,resourceLoaded.bind(this),"arraybuffer")},!1);'
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
    this.utils.postMessage(resource)
  }

  resourceLoaded(chunk) {
    this.storage.setItem(this.resource, chunk)
    this.callback(chunk, "cdn");
  }
}

module.exports = CDNRequester;
