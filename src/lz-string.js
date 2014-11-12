// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by Apache
// license that can be found in the LICENSE file.

var BaseObject = require('base_object')

class LZString extends BaseObject {
  get name() { return 'LZString' }
  constructor() {
    this.compressor = new Worker(this.getWorkerURL())
    this.compressor.onmessage = (e) => this.chunkReceived(e.data)
  }

  getWorkerURL() {
    var content = 'var compress=function(o){if(null==o)return"";var t,r,e,i={},a={},n="",s="",p="",c=2,h=3,l=2,f="",d=0,u=0,w=String.fromCharCode;for(e=0;e<o.length;e+=1)if(n=o.charAt(e),Object.prototype.hasOwnProperty.call(i,n)||(i[n]=h++,a[n]=!0),s=p+n,Object.prototype.hasOwnProperty.call(i,s))p=s;else{if(Object.prototype.hasOwnProperty.call(a,p)){if(p.charCodeAt(0)<256){for(t=0;l>t;t++)d<<=1,15==u?(u=0,f+=w(d),d=0):u++;for(r=p.charCodeAt(0),t=0;8>t;t++)d=d<<1|1&r,15==u?(u=0,f+=w(d),d=0):u++,r>>=1}else{for(r=1,t=0;l>t;t++)d=d<<1|r,15==u?(u=0,f+=w(d),d=0):u++,r=0;for(r=p.charCodeAt(0),t=0;16>t;t++)d=d<<1|1&r,15==u?(u=0,f+=w(d),d=0):u++,r>>=1}c--,0==c&&(c=Math.pow(2,l),l++),delete a[p]}else for(r=i[p],t=0;l>t;t++)d=d<<1|1&r,15==u?(u=0,f+=w(d),d=0):u++,r>>=1;c--,0==c&&(c=Math.pow(2,l),l++),i[s]=h++,p=String(n)}if(""!==p){if(Object.prototype.hasOwnProperty.call(a,p)){if(p.charCodeAt(0)<256){for(t=0;l>t;t++)d<<=1,15==u?(u=0,f+=w(d),d=0):u++;for(r=p.charCodeAt(0),t=0;8>t;t++)d=d<<1|1&r,15==u?(u=0,f+=w(d),d=0):u++,r>>=1}else{for(r=1,t=0;l>t;t++)d=d<<1|r,15==u?(u=0,f+=w(d),d=0):u++,r=0;for(r=p.charCodeAt(0),t=0;16>t;t++)d=d<<1|1&r,15==u?(u=0,f+=w(d),d=0):u++,r>>=1}c--,0==c&&(c=Math.pow(2,l),l++),delete a[p]}else for(r=i[p],t=0;l>t;t++)d=d<<1|1&r,15==u?(u=0,f+=w(d),d=0):u++,r>>=1;c--,0==c&&(c=Math.pow(2,l),l++)}for(r=2,t=0;l>t;t++)d=d<<1|1&r,15==u?(u=0,f+=w(d),d=0):u++,r>>=1;for(;;){if(d<<=1,15==u){f+=w(d);break}u++}return f},decompress=function(o){if(null==o)return"";if(""==o)return null;var t,r,e,i,a,n,s,p,c=[],h=4,l=4,f=3,d="",u="",w=String.fromCharCode,v={string:o,val:o.charCodeAt(0),position:32768,index:1};for(r=0;3>r;r+=1)c[r]=r;for(i=0,n=Math.pow(2,2),s=1;s!=n;)a=v.val&v.position,v.position>>=1,0==v.position&&(v.position=32768,v.val=v.string.charCodeAt(v.index++)),i|=(a>0?1:0)*s,s<<=1;switch(t=i){case 0:for(i=0,n=Math.pow(2,8),s=1;s!=n;)a=v.val&v.position,v.position>>=1,0==v.position&&(v.position=32768,v.val=v.string.charCodeAt(v.index++)),i|=(a>0?1:0)*s,s<<=1;p=w(i);break;case 1:for(i=0,n=Math.pow(2,16),s=1;s!=n;)a=v.val&v.position,v.position>>=1,0==v.position&&(v.position=32768,v.val=v.string.charCodeAt(v.index++)),i|=(a>0?1:0)*s,s<<=1;p=w(i);break;case 2:return""}for(c[3]=p,e=u=p;;){if(v.index>v.string.length)return"";for(i=0,n=Math.pow(2,f),s=1;s!=n;)a=v.val&v.position,v.position>>=1,0==v.position&&(v.position=32768,v.val=v.string.charCodeAt(v.index++)),i|=(a>0?1:0)*s,s<<=1;switch(p=i){case 0:for(i=0,n=Math.pow(2,8),s=1;s!=n;)a=v.val&v.position,v.position>>=1,0==v.position&&(v.position=32768,v.val=v.string.charCodeAt(v.index++)),i|=(a>0?1:0)*s,s<<=1;c[l++]=w(i),p=l-1,h--;break;case 1:for(i=0,n=Math.pow(2,16),s=1;s!=n;)a=v.val&v.position,v.position>>=1,0==v.position&&(v.position=32768,v.val=v.string.charCodeAt(v.index++)),i|=(a>0?1:0)*s,s<<=1;c[l++]=w(i),p=l-1,h--;break;case 2:return u}if(0==h&&(h=Math.pow(2,f),f++),c[p])d=c[p];else{if(p!==l)return null;d=e+e.charAt(0)}u+=d,c[l++]=e+d.charAt(0),h--,e=d,0==h&&(h=Math.pow(2,f),f++)}};this.addEventListener("message",function(o){"compress"===o.data.type?postMessage({url:o.data.url,chunk:compress(o.data.chunk)}):"decompress"===o.data.type&&postMessage({url:o.data.url,chunk:decompress(o.data.chunk)})},!1);'
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

  compress(url, chunk, callback) {
    this.postMessage(url, 'compress', chunk, callback)
  }

  decompress(url, chunk, callback) {
    this.postMessage(url, 'decompress', chunk, callback)
  }

  postMessage(url, type, chunk, callback) {
    this.callback = callback
    var message = {'url': url, 'type': type, 'chunk': chunk}
    this.compressor.postMessage(message)
  }

  chunkReceived(chunkObj) {
    this.callback(chunkObj.url, chunkObj.chunk)
  }
}

module.exports = LZString;

