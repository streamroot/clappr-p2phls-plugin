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
    var content = 'var compress=function(o){if(null==o)return"";var t,r,e,i={},a={},s="",n="",p="",c=2,h=3,f=2,l="",d=0,w=0,u=String.fromCharCode;for(e=0;e<o.length;e+=1)if(s=o.charAt(e),Object.prototype.hasOwnProperty.call(i,s)||(i[s]=h++,a[s]=!0),n=p+s,Object.prototype.hasOwnProperty.call(i,n))p=n;else{if(Object.prototype.hasOwnProperty.call(a,p)){if(p.charCodeAt(0)<256){for(t=0;f>t;t++)d<<=1,15==w?(w=0,l+=u(d),d=0):w++;for(r=p.charCodeAt(0),t=0;8>t;t++)d=d<<1|1&r,15==w?(w=0,l+=u(d),d=0):w++,r>>=1}else{for(r=1,t=0;f>t;t++)d=d<<1|r,15==w?(w=0,l+=u(d),d=0):w++,r=0;for(r=p.charCodeAt(0),t=0;16>t;t++)d=d<<1|1&r,15==w?(w=0,l+=u(d),d=0):w++,r>>=1}c--,0==c&&(c=Math.pow(2,f),f++),delete a[p]}else for(r=i[p],t=0;f>t;t++)d=d<<1|1&r,15==w?(w=0,l+=u(d),d=0):w++,r>>=1;c--,0==c&&(c=Math.pow(2,f),f++),i[n]=h++,p=String(s)}if(""!==p){if(Object.prototype.hasOwnProperty.call(a,p)){if(p.charCodeAt(0)<256){for(t=0;f>t;t++)d<<=1,15==w?(w=0,l+=u(d),d=0):w++;for(r=p.charCodeAt(0),t=0;8>t;t++)d=d<<1|1&r,15==w?(w=0,l+=u(d),d=0):w++,r>>=1}else{for(r=1,t=0;f>t;t++)d=d<<1|r,15==w?(w=0,l+=u(d),d=0):w++,r=0;for(r=p.charCodeAt(0),t=0;16>t;t++)d=d<<1|1&r,15==w?(w=0,l+=u(d),d=0):w++,r>>=1}c--,0==c&&(c=Math.pow(2,f),f++),delete a[p]}else for(r=i[p],t=0;f>t;t++)d=d<<1|1&r,15==w?(w=0,l+=u(d),d=0):w++,r>>=1;c--,0==c&&(c=Math.pow(2,f),f++)}for(r=2,t=0;f>t;t++)d=d<<1|1&r,15==w?(w=0,l+=u(d),d=0):w++,r>>=1;for(;;){if(d<<=1,15==w){l+=u(d);break}w++}return l},decompress=function(o){if(null==o)return"";if(""==o)return null;var t,r,e,i,a,s,n,p,c=[],h=4,f=4,l=3,d="",w="",u=String.fromCharCode,v={string:o,val:o.charCodeAt(0),position:32768,index:1};for(r=0;3>r;r+=1)c[r]=r;for(i=0,s=Math.pow(2,2),n=1;n!=s;)a=v.val&v.position,v.position>>=1,0==v.position&&(v.position=32768,v.val=v.string.charCodeAt(v.index++)),i|=(a>0?1:0)*n,n<<=1;switch(t=i){case 0:for(i=0,s=Math.pow(2,8),n=1;n!=s;)a=v.val&v.position,v.position>>=1,0==v.position&&(v.position=32768,v.val=v.string.charCodeAt(v.index++)),i|=(a>0?1:0)*n,n<<=1;p=u(i);break;case 1:for(i=0,s=Math.pow(2,16),n=1;n!=s;)a=v.val&v.position,v.position>>=1,0==v.position&&(v.position=32768,v.val=v.string.charCodeAt(v.index++)),i|=(a>0?1:0)*n,n<<=1;p=u(i);break;case 2:return""}for(c[3]=p,e=w=p;;){if(v.index>v.string.length)return"";for(i=0,s=Math.pow(2,l),n=1;n!=s;)a=v.val&v.position,v.position>>=1,0==v.position&&(v.position=32768,v.val=v.string.charCodeAt(v.index++)),i|=(a>0?1:0)*n,n<<=1;switch(p=i){case 0:for(i=0,s=Math.pow(2,8),n=1;n!=s;)a=v.val&v.position,v.position>>=1,0==v.position&&(v.position=32768,v.val=v.string.charCodeAt(v.index++)),i|=(a>0?1:0)*n,n<<=1;c[f++]=u(i),p=f-1,h--;break;case 1:for(i=0,s=Math.pow(2,16),n=1;n!=s;)a=v.val&v.position,v.position>>=1,0==v.position&&(v.position=32768,v.val=v.string.charCodeAt(v.index++)),i|=(a>0?1:0)*n,n<<=1;c[f++]=u(i),p=f-1,h--;break;case 2:return w}if(0==h&&(h=Math.pow(2,l),l++),c[p])d=c[p];else{if(p!==f)return null;d=e+e.charAt(0)}w+=d,c[f++]=e+d.charAt(0),h--,e=d,0==h&&(h=Math.pow(2,l),l++)}};this.addEventListener("message",function(o){"compress"===o.data.type?postMessage(compress(o.data.chunk)):"decompress"===o.data.type&&postMessage(decompress(o.data.chunk))},!1);'
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

  compress(chunk, callback) {
    this.postMessage('compress', chunk, callback)
  }

  decompress(chunk, callback) {
    this.postMessage('decompress', chunk, callback)
  }

  postMessage(type, chunk, callback) {
    this.callback = callback
    var message = {'type': type, 'chunk': chunk}
    this.compressor.postMessage(message)
  }

  chunkReceived(chunk) {
    this.callback(chunk)
  }
}

module.exports = LZString;

