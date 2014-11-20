var Settings = require('../src/settings');
var Storage = require('../src/storage')

describe('Storage', function() {
  beforeEach(() => {
    this.storage = new Storage();
    Settings.maxStorageChunks = 10;
  })

  it('should store segment', () => {
    this.storage.setItem("segmentName", "segmentContent");
    expect(this.storage.contain("segmentName")).to.be.true;
    expect(this.storage.getItem("segmentName")).to.be.equal('segmentContent');
  });

  it('should not store equal segments', () => {
    this.storage.setItem("segmentName", "segmentContent");
    this.storage.setItem("segmentName", "segmentContent");
    expect(this.storage.size).to.be.equal(1);
  });

  it('should respect maxStorageChunks', () => {
    Settings.maxStorageChunks = 3
    this.storage.setItem("segment1", "segmentContent1");
    this.storage.setItem("segment2", "segmentContent2");
    this.storage.setItem("segment3", "segmentContent3");
    this.storage.setItem("segment4", "segmentContent4");
    this.storage.setItem("segment5", "segmentContent5");
    expect(this.storage.size).to.be.equal(3);
  });

  it('should remove older chunks when reach maxStorageChunks', () => {
    Settings.maxStorageChunks = 3
    this.storage.setItem("segment1", "segmentContent1");
    this.storage.setItem("segment2", "segmentContent2");
    this.storage.setItem("segment3", "segmentContent3");
    this.storage.setItem("segment4", "segmentContent4");
    expect(this.storage.contain("segment1")).to.be.false;
  });

  it('should store big segments', () => {
    var bigSegment = (new Array(10*1024*1024)).join("x");
    for (var i = 0; i <= Settings.maxStorageChunks; i++) {
      this.storage.setItem("segment" + i, bigSegment);
    }
    expect(this.storage.getItem('segment1')).to.be.equal(bigSegment);
  });

});
