var FlashUploader = require('../src/flash_uploader');

describe('FlashUploader', function() {
  beforeEach(() => {
    this.receivedChunk = '';
    this.clock = sinon.useFakeTimers(Date.now());
    this.sendPartCallback = function(subSegment) { this.receivedChunk += subSegment }.bind(this);
    this.finishCallback = function() {}.bind(this);
    this.flashUploader = new FlashUploader();
    this.flashUploader.MAX_SIZE = 10;
  })

  it('should send chunks smaller than MAX_SIZE', () => {
    this.chunk = (new Array(this.flashUploader.MAX_SIZE - 1).join("x"));
    this.flashUploader.send(this.sendPartCallback, this.chunk, this.finishCallback);
    this.clock.tick(100);
    expect(this.receivedChunk).to.be.equal(this.chunk);
  });

  it('should send chunks bigger than MAX_SIZE', () => {
    this.chunk = (new Array(this.flashUploader.MAX_SIZE * 50).join("x"));
    this.chunk += "xxx";
    this.flashUploader.send(this.sendPartCallback, this.chunk, this.finishCallback);
    this.clock.tick(100);
    expect(this.receivedChunk).to.be.equal(this.chunk);
  });

});
