define(function(require, exports, module) {
"use strict";

var battleBG = new (require("pkhack/battleBG").BattleBG);

battleBG.speak();

var oReq = new XMLHttpRequest();
oReq.open("GET", "/bgs.dat", true);
oReq.responseType = "arraybuffer";
 
oReq.onload = function (oEvent) {
  var arrayBuffer = oReq.response; 
  if (arrayBuffer) {
    var byteArray = new Uint8Array(arrayBuffer);
    for (var i = 0; i < byteArray.byteLength; i++) {
      // do something with each byte in the array
    }
  }
};
 
oReq.send(null);
});