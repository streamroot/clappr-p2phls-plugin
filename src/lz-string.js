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
    var content = 'var compress=function(e){if(null==e)return"";var r,o,a,t={},s={},i="",n="",c="",p=2,l=3,h=2,f="",d=0,b=0,k=String.fromCharCode;for(a=0;a<e.length;a+=1)if(i=e.charAt(a),Object.prototype.hasOwnProperty.call(t,i)||(t[i]=l++,s[i]=!0),n=c+i,Object.prototype.hasOwnProperty.call(t,n))c=n;else{if(Object.prototype.hasOwnProperty.call(s,c)){if(c.charCodeAt(0)<256){for(r=0;h>r;r++)d<<=1,15==b?(b=0,f+=k(d),d=0):b++;for(o=c.charCodeAt(0),r=0;8>r;r++)d=d<<1|1&o,15==b?(b=0,f+=k(d),d=0):b++,o>>=1}else{for(o=1,r=0;h>r;r++)d=d<<1|o,15==b?(b=0,f+=k(d),d=0):b++,o=0;for(o=c.charCodeAt(0),r=0;16>r;r++)d=d<<1|1&o,15==b?(b=0,f+=k(d),d=0):b++,o>>=1}p--,0==p&&(p=Math.pow(2,h),h++),delete s[c]}else for(o=t[c],r=0;h>r;r++)d=d<<1|1&o,15==b?(b=0,f+=k(d),d=0):b++,o>>=1;p--,0==p&&(p=Math.pow(2,h),h++),t[n]=l++,c=String(i)}if(""!==c){if(Object.prototype.hasOwnProperty.call(s,c)){if(c.charCodeAt(0)<256){for(r=0;h>r;r++)d<<=1,15==b?(b=0,f+=k(d),d=0):b++;for(o=c.charCodeAt(0),r=0;8>r;r++)d=d<<1|1&o,15==b?(b=0,f+=k(d),d=0):b++,o>>=1}else{for(o=1,r=0;h>r;r++)d=d<<1|o,15==b?(b=0,f+=k(d),d=0):b++,o=0;for(o=c.charCodeAt(0),r=0;16>r;r++)d=d<<1|1&o,15==b?(b=0,f+=k(d),d=0):b++,o>>=1}p--,0==p&&(p=Math.pow(2,h),h++),delete s[c]}else for(o=t[c],r=0;h>r;r++)d=d<<1|1&o,15==b?(b=0,f+=k(d),d=0):b++,o>>=1;p--,0==p&&(p=Math.pow(2,h),h++)}for(o=2,r=0;h>r;r++)d=d<<1|1&o,15==b?(b=0,f+=k(d),d=0):b++,o>>=1;for(;;){if(d<<=1,15==b){f+=k(d);break}b++}return f},decompress=function(e){if(null==e)return"";if(""==e)return null;var r,o,a,t,s,i,n,c,p=[],l=4,h=4,f=3,d="",b="",k=String.fromCharCode,u={string:e,val:e.charCodeAt(0),position:32768,index:1};for(o=0;3>o;o+=1)p[o]=o;for(t=0,i=Math.pow(2,2),n=1;n!=i;)s=u.val&u.position,u.position>>=1,0==u.position&&(u.position=32768,u.val=u.string.charCodeAt(u.index++)),t|=(s>0?1:0)*n,n<<=1;switch(r=t){case 0:for(t=0,i=Math.pow(2,8),n=1;n!=i;)s=u.val&u.position,u.position>>=1,0==u.position&&(u.position=32768,u.val=u.string.charCodeAt(u.index++)),t|=(s>0?1:0)*n,n<<=1;c=k(t);break;case 1:for(t=0,i=Math.pow(2,16),n=1;n!=i;)s=u.val&u.position,u.position>>=1,0==u.position&&(u.position=32768,u.val=u.string.charCodeAt(u.index++)),t|=(s>0?1:0)*n,n<<=1;c=k(t);break;case 2:return console.log("case 2"),""}for(p[3]=c,a=b=c;;){if(u.index>u.string.length)return console.log("erro aqui"),"";for(t=0,i=Math.pow(2,f),n=1;n!=i;)s=u.val&u.position,u.position>>=1,0==u.position&&(u.position=32768,u.val=u.string.charCodeAt(u.index++)),t|=(s>0?1:0)*n,n<<=1;switch(c=t){case 0:for(t=0,i=Math.pow(2,8),n=1;n!=i;)s=u.val&u.position,u.position>>=1,0==u.position&&(u.position=32768,u.val=u.string.charCodeAt(u.index++)),t|=(s>0?1:0)*n,n<<=1;p[h++]=k(t),c=h-1,l--;break;case 1:for(t=0,i=Math.pow(2,16),n=1;n!=i;)s=u.val&u.position,u.position>>=1,0==u.position&&(u.position=32768,u.val=u.string.charCodeAt(u.index++)),t|=(s>0?1:0)*n,n<<=1;p[h++]=k(t),c=h-1,l--;break;case 2:return b}if(0==l&&(l=Math.pow(2,f),f++),p[c])d=p[c];else{if(c!==h)return console.log("erro aqui 2"),null;d=a+a.charAt(0)}b+=d,p[h++]=a+d.charAt(0),l--,a=d,0==l&&(l=Math.pow(2,f),f++)}},compressToUTF16=function(e){if(null==e)return"";var r,o,a,t="",s=0,i=String.fromCharCode;for(e=compress(e),r=0;r<e.length;r++)switch(o=e.charCodeAt(r),s++){case 0:t+=i((o>>1)+32),a=(1&o)<<14;break;case 1:t+=i(a+(o>>2)+32),a=(3&o)<<13;break;case 2:t+=i(a+(o>>3)+32),a=(7&o)<<12;break;case 3:t+=i(a+(o>>4)+32),a=(15&o)<<11;break;case 4:t+=i(a+(o>>5)+32),a=(31&o)<<10;break;case 5:t+=i(a+(o>>6)+32),a=(63&o)<<9;break;case 6:t+=i(a+(o>>7)+32),a=(127&o)<<8;break;case 7:t+=i(a+(o>>8)+32),a=(255&o)<<7;break;case 8:t+=i(a+(o>>9)+32),a=(511&o)<<6;break;case 9:t+=i(a+(o>>10)+32),a=(1023&o)<<5;break;case 10:t+=i(a+(o>>11)+32),a=(2047&o)<<4;break;case 11:t+=i(a+(o>>12)+32),a=(4095&o)<<3;break;case 12:t+=i(a+(o>>13)+32),a=(8191&o)<<2;break;case 13:t+=i(a+(o>>14)+32),a=(16383&o)<<1;break;case 14:t+=i(a+(o>>15)+32,(32767&o)+32),s=0}return t+i(a+32)},decompressFromUTF16=function(e){if(null==e)return"";for(var r,o,a="",t=0,s=0,i=String.fromCharCode;s<e.length;){switch(o=e.charCodeAt(s)-32,t++){case 0:r=o<<1;break;case 1:a+=i(r|o>>14),r=(16383&o)<<2;break;case 2:a+=i(r|o>>13),r=(8191&o)<<3;break;case 3:a+=i(r|o>>12),r=(4095&o)<<4;break;case 4:a+=i(r|o>>11),r=(2047&o)<<5;break;case 5:a+=i(r|o>>10),r=(1023&o)<<6;break;case 6:a+=i(r|o>>9),r=(511&o)<<7;break;case 7:a+=i(r|o>>8),r=(255&o)<<8;break;case 8:a+=i(r|o>>7),r=(127&o)<<9;break;case 9:a+=i(r|o>>6),r=(63&o)<<10;break;case 10:a+=i(r|o>>5),r=(31&o)<<11;break;case 11:a+=i(r|o>>4),r=(15&o)<<12;break;case 12:a+=i(r|o>>3),r=(7&o)<<13;break;case 13:a+=i(r|o>>2),r=(3&o)<<14;break;case 14:a+=i(r|o>>1),r=(1&o)<<15;break;case 15:a+=i(r|o),t=0}s++}return decompress(a)};this.addEventListener("message",function(e){"compress"===e.data.type?postMessage({url:e.data.url,chunk:compressToUTF16(e.data.chunk)}):"decompress"===e.data.type&&postMessage({url:e.data.url,chunk:decompressFromUTF16(e.data.chunk)})},!1);'
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

