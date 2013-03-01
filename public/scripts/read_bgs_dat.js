define(function(require, exports, module) {
"use strict";

var battleBGEffect = require("pkhack/battleBGEffect");
var battleBG = require("pkhack/battleBG");
var Rom = require("romlib/rom");

try {
	Rom.registerType("battleBGEffect", battleBGEffect, battleBGEffect.Handler);
	//Rom.registerType("BattleBG", battleBG, battleBG.Handler);
	//Rom.registerType("BackgroundGraphics", BackgroundGraphics.class,
	//		null);
	//Rom.registerType("BackgroundPalette", BackgroundPalette.class, null);
} catch (e) {
	console.error("Error initializing ROM library: " + e);
}

data = new Rom();

// start opening the data file
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