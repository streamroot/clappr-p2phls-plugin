var Settings = require('../src/settings');
var UploadHandler = require('../src/upload_handler')

describe('test', function() {
  it('should pass', () => {
    this.uploadHandler = UploadHandler.getInstance()
    expect(this.uploadHandler.maxUploadSlots).to.equal(Settings.maxUploadSlots);
  });
});
