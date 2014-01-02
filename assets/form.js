var suggestedLayers = {
  "Giygas (221 / 222)": [221, 222],
  "New Age Retro Hippie (270 / 279)": [270, 269]
}

var layer1, layer2, suggested, aspectRatio, frameskip, read_bgs_dat;

document.addEventListener('DOMContentLoaded', function() {
  // lol
  layer1 = document.getElementById("layer1");
  layer2 = document.getElementById("layer2");
  suggested = document.getElementById("suggested");
  aspectRatio = document.getElementById("aspectRatio");
  frameskip = document.getElementById("frameskip");

  createLayerDropdown();
  createSuggestedLayersDropdown();
  setupDropdownPushStates();

  window.History.Adapter.bind(window,'statechange',function() {
    require("read_bgs_dat").setupEngine();
  });
});

function createLayerDropdown() {
  var optionHtml = "<option value='-1'></option>";
  for (var i = 0; i < 327; i++) {
    optionHtml += "<option value='" + i + "'>" + i + "</option>";
  }
  layer1.innerHTML = optionHtml;
  layer2.innerHTML = optionHtml;
}

function createSuggestedLayersDropdown() {
  var optionHtml = "<option value='-1'></option>", i = 0;

  for (var key in suggestedLayers) {
    if (suggestedLayers.hasOwnProperty(key)) {
      optionHtml += "<option value='" + key + "'>" + key + "</option>";
    }
  }
  suggested.innerHTML = optionHtml;
}

function setupDropdownPushStates() {

  layer1.onchange = function(e) {
    var value = this.value;
    if (value < 0)
      value = 0;
    History.pushState( {layer1: value}, document.title, setUrlFromString("layer1=" + value));
  };

  layer2.onchange = function(e) {
    var value = this.value;
    if (value < 0)
      value = 0;
    History.pushState( {layer2: value}, document.title, setUrlFromString("layer2=" + value));
  };

  suggested.onchange = function(e) {
    var value = this.value;
    try {
      layer1.selectedIndex = suggestedLayers[value][0] + 1;
      layer1.onchange();
      layer2.selectedIndex = suggestedLayers[value][1] + 1;
      layer2.onchange();
    } catch (e) {}
  };

  aspectRatio.onchange = function(e) {
    var value = this.value;
    History.pushState( {aspectRatio: value}, document.title, setUrlFromString("aspectRatio=" + value));
  };

  frameskip.onchange  = function(e) {
    var value = this.value;
    History.pushState( {frameskip: value}, document.title, setUrlFromString("frameskip=" + value));
  };

}

function randomLayer() {
  layer1.selectedIndex = String(Math.floor(Math.random() * 327));
  layer1.onchange();
  layer2.selectedIndex = String(Math.floor(Math.random() * 327));
  layer2.onchange();
};
