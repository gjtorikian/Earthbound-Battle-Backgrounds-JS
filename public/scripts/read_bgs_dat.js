define(function(require, exports, module) {
"use strict";

var rom = require("romlib/rom");

var battleBGEffect = require("pkhack/battleBGEffect");
var battleBG = require("pkhack/battleBG");

var backgroundGraphics = require("romlib/backgroundGraphics");
var backgroundPalette = require("romlib/backgroundPalette");
var backgroundLayer = require("romlib/backgroundLayer");
try {
    rom.registerType("battleBGEffect", battleBGEffect, battleBGEffect.Handler);
    rom.registerType("battleBG", battleBG, battleBG.Handler);
    rom.registerType("backgroundGraphics", backgroundGraphics, null);
    rom.registerType("BackgroundPalette", backgroundPalette, null);
} catch (e) {
    console.error("Error initializing ROM library: " + e);
}

rom.rom();

// start opening the data file
var oReq = new XMLHttpRequest();
oReq.open("GET", "/bgs.dat", true);
oReq.responseType = "arraybuffer";
 
oReq.onload = function (oEvent) {
    var arrayBuffer = oReq.response; 
    if (arrayBuffer) {
        // unlike Java, I don't need to read and convert this stream. woo!
        var byteArray = new Uint8Array(arrayBuffer);
        rom.open(byteArray);
    }
};
 
oReq.send(null);
});