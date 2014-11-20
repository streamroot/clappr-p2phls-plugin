var Settings = require('../src/settings');
var Storage = require('../src/storage')

describe('Storage', function() {
  beforeEach(() => {
    this.storage = new Storage();
    Settings.maxStorageChunks = 10;
  })

  it('should store segment', () => {
    this.storage.setItem("segmentName.ts", "segmentContent");
    expect(this.storage.contain("segmentName.ts")).to.be.true;
    expect(this.storage.getItem("segmentName.ts")).to.be.equal('segmentContent');
  });

  it('should not store equal segments', () => {
    this.storage.setItem("segmentName.ts", "segmentContent");
    this.storage.setItem("segmentName.ts", "segmentContent");
    expect(this.storage.size).to.be.equal(1);
  });

  it('should respect maxStorageChunks', () => {
    Settings.maxStorageChunks = 3
    this.storage.setItem("segment1.ts", "segmentContent1");
    this.storage.setItem("segment2.ts", "segmentContent2");
    this.storage.setItem("segment3.ts", "segmentContent3");
    this.storage.setItem("segment4.ts", "segmentContent4");
    this.storage.setItem("segment5.ts", "segmentContent5");
    expect(this.storage.size).to.be.equal(3);
  });

  it('should remove older chunks when reach maxStorageChunks', () => {
    Settings.maxStorageChunks = 3
    this.storage.setItem("segment1.ts", "segmentContent1");
    this.storage.setItem("segment2.ts", "segmentContent2");
    this.storage.setItem("segment3.ts", "segmentContent3");
    this.storage.setItem("segment4.ts", "segmentContent4");
    expect(this.storage.contain("segment1.ts")).to.be.false;
  });

  it('should discard querystrings', () => {
    Settings.maxStorageChunks = 3
    this.storage.setItem("segment1.ts?query=string", "segmentContent1");
    expect(this.storage.contain("segment1.ts")).to.be.true;
    expect(this.storage.contain("segment1.ts?query=string")).to.be.true;
  });

  it('should store big segments', () => {
    var bigSegment = (new Array(10*1024*1024)).join("x");
    for (var i = 0; i <= Settings.maxStorageChunks; i++) {
      this.storage.setItem("segment" + i + ".ts", bigSegment);
    }
    expect(this.storage.getItem('segment1.ts')).to.be.equal(bigSegment);
  });

});
