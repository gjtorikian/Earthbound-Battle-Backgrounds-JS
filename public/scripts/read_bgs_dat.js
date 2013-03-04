define(function(require, exports, module) {
"use strict";

var Rom = require("romlib/Rom");

var BattleBGEffect = require("pkhack/BattleBGEffect");
var BattleBG = require("pkhack/BattleBG");

var BackgroundGraphics = require("romlib/BackgroundGraphics");
var BackgroundPalette = require("romlib/BackgroundPalette");
var BackgroundLayer = require("romlib/BackgroundLayer");
try {
    Rom.registerType("BattleBGEffect", BattleBGEffect, BattleBGEffect.Handler);
    Rom.registerType("BattleBG", BattleBG, BattleBG.Handler);
    Rom.registerType("BackgroundGraphics", BackgroundGraphics, null);
    Rom.registerType("BackgroundPalette", BackgroundPalette, null);
} catch (e) {
    console.error("Error initializing ROM library: " + e);
}

var Rom = Rom.Rom();

// start opening the data file
var oReq = new XMLHttpRequest();
oReq.open("GET", "/bgs.dat", true);
oReq.responseType = "arraybuffer";
 
oReq.onload = function (oEvent) {
    var arrayBuffer = oReq.response; 
    if (arrayBuffer) {
        // unlike Java, I don't need to read and convert this stream. woo!
        var byteArray = new Uint8Array(arrayBuffer);
        Rom.open(byteArray);
    }
};
 
oReq.send(null);
});