var suggestedLayers = {
  "Giygas": [221, 222],
  "New Age Retro Hippie": [270, 269]
}

$( document ).ready(function() {
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
  $( "#layer1" ).append(optionHtml);
  $( "#layer2" ).append(optionHtml);
}

function setupDropdownPushStates() {

  $( "#layer1" ).change(function() {
    var value = $(this).val();
    History.pushState( {layer1: value}, document.title, setUrlFromString("layer1=" + value));
  });
  $( "#layer2" ).change(function() {
    var value = $(this).val();
    History.pushState( {layer2: value}, document.title, setUrlFromString("layer2=" + value));
  });
  $( "#aspectRatio" ).change(function() {
    var value = $(this).val();
    History.pushState( {aspectRatio: value}, document.title, setUrlFromString("aspectRatio=" + value));
  });
  $( "#frameskip" ).change(function() {
    var value = $(this).val();
    History.pushState( {frameskip: value}, document.title, setUrlFromString("frameskip=" + value));
  });

}

function randomLayer() {
  document.getElementById("layer1").selectedIndex = String(Math.floor(Math.random() * 327));
  document.getElementById("layer1").onchange();
  document.getElementById("layer2").selectedIndex = String(Math.floor(Math.random() * 327));
  document.getElementById("layer2").onchange();
};
