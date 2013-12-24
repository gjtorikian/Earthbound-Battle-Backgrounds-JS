var suggestedLayers = {
  "Giygas": [221, 222],
  "New Age Retro Hippie": [270, 269]
}

$( document ).ready(function() {

  createLayerDropdown();

  var History = window.History;

  History.Adapter.bind(window,'statechange',function() { // Note: We are using statechange instead of popstate
    var r = require("read_bgs_dat");
    r.setupEngine();
  });

  setupDropdownListeners();
});

function createLayerDropdown() {
  var optionHtml = "";
  for (var i = 0; i < 327; i++) {
    optionHtml += "<option>" + i + "</option>";
  }
  $( "#layer1" ).append(optionHtml);
  $( "#layer2" ).append(optionHtml);
}

function setupDropdownListeners() {
  $( "#layer1" ).change(function() {
    var value = $(this).val();
    History.pushState( {layer1: value}, document.title, setUrlFromString("layer1=" + value));
  });
  $( "#layer2" ).change(function() {
    var value = $(this).val();
    History.pushState( {layer1: value}, document.title, setUrlFromString("layer2=" + value));
  });
}
