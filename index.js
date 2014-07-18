var UiPlugin = require('ui_plugin');
var JST = require('./jst');

class P2PHLS extends UiPlugin {
  get name() { return 'p2phls'; }

  render() {
    var style = $('<style>').html(JST.CSS[p2phls]());
    this.$el.append(style);
    return this;
  }
}

P2PHLS.canPlay = function(resource) {
  return !!resource.match("(.*)?p2p=true(.*)")
}

module.exports = window.P2PHLS = P2PHLS;
