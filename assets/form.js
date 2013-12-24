var suggestedLayers = {
  "Giygas (221 / 222)": [221, 222],
  "New Age Retro Hippie (270 / 279)": [270, 269]
}

document.addEventListener('DOMContentLoaded', function() {
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
  document.getElementById("layer1").innerHTML = optionHtml;
  document.getElementById("layer2").innerHTML = optionHtml;
}

function createSuggestedLayersDropdown() {
  var optionHtml = "<option value='-1'></option>", i = 0;

  for (var key in suggestedLayers) {
    if (suggestedLayers.hasOwnProperty(key)) {
      optionHtml += "<option value='" + key + "'>" + key + "</option>";
    }
  }
  document.getElementById("suggested").innerHTML = optionHtml;
}

function setupDropdownPushStates() {

  document.getElementById("layer1").onchange = function(e) {
    var value = this.value;
    History.pushState( {layer1: value}, document.title, setUrlFromString("layer1=" + value));
  };

  document.getElementById("layer2").onchange = function(e) {
    var value = this.value;
    History.pushState( {layer2: value}, document.title, setUrlFromString("layer2=" + value));
  };

  document.getElementById("suggested").onchange = function(e) {
    var value = this.value;
    document.getElementById("layer1").selectedIndex = suggestedLayers[value][0] + 1;
    document.getElementById("layer1").onchange();
    document.getElementById("layer2").selectedIndex = suggestedLayers[value][1] + 1;
    document.getElementById("layer2").onchange();
  };

  document.getElementById("aspectRatio").onchange = function(e) {
    var value = this.value;
    History.pushState( {aspectRatio: value}, document.title, setUrlFromString("aspectRatio=" + value));
  };

  document.getElementById("frameskip" ).onchange  = function(e) {
    var value = this.value;
    History.pushState( {frameskip: value}, document.title, setUrlFromString("frameskip=" + value));
  };

}

function randomLayer() {
  document.getElementById("layer1").selectedIndex = String(Math.floor(Math.random() * 327));
  document.getElementById("layer1").onchange();
  document.getElementById("layer2").selectedIndex = String(Math.floor(Math.random() * 327));
  document.getElementById("layer2").onchange();
};
