$( document ).ready(function() {

  createLayerDropdown();

});

function createLayerDropdown() {
  var optionHtml = "";
  for (var i = 0; i < 327; i++) {
    optionHtml += "<option>" + i + "</option>";
  }
  $( "#layer1" ).append(optionHtml);
  $( "#layer2" ).append(optionHtml);
}
