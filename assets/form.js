var suggestedLayers = {
  "Giygas": [221, 222],
  "New Age Retro Hippie": [270, 269]
}

document.addEventListener('DOMContentLoaded', function() {
  createLayerDropdown();

  setupDropdownPushStates();

  window.History.Adapter.bind(window,'statechange',function() {
    require("read_bgs_dat").setupEngine();
  });
});


function createLayerDropdown() {
  var optionHtml = "";
  for (var i = 0; i < 327; i++) {
    optionHtml += "<option value='" + i + "'>" + i + "</option>";
  }
  document.getElementById("layer1").innerHTML = optionHtml;
  document.getElementById("layer2").innerHTML = optionHtml;
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
