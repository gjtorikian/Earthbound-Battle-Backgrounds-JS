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

// TODO: don't make Rom global?
window.Rom = Rom.Rom();

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

        var engine = require("engine");

        console.log("Starting engine...");

        var layer1_val = 270;
        var layer2_val = 269;

        console.log("Creating layer 1: " + layer1_val);
        var layer1 = BackgroundLayer.BackgroundLayer(Rom, layer1_val);

        console.log("Creating layer 2: " + layer2_val);
        var layer2 = BackgroundLayer.BackgroundLayer(Rom, layer2_val);

        var frameskip = 3;
        var aspectRatio = 16;   

        var fps = 15;
        var alpha = parseFloat(0.5);

        if (layer2.getEntry() == 0)
            alpha = parseFloat(1.0);

        var tick = 0;

        engine.start(layer1, layer2, tick, fps, aspectRatio, frameskip, alpha);
    }
};
 
oReq.send(null);
});