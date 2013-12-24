define(function(require, exports, module) {
"use strict";

var Rom = require("romlib/Rom");

var BattleBGEffect = require("pkhack/BattleBGEffect");
var BattleBG = require("pkhack/BattleBG");

var BackgroundGraphics = require("romlib/BackgroundGraphics");
var BackgroundPalette = require("romlib/BackgroundPalette");
var BackgroundLayer = require("romlib/BackgroundLayer");

var Engine = require("engine");

try {
    Rom.registerType("BattleBGEffect", BattleBGEffect, BattleBGEffect.Handler);
    Rom.registerType("BattleBG", BattleBG, BattleBG.Handler);
    Rom.registerType("BackgroundGraphics", BackgroundGraphics, null);
    Rom.registerType("BackgroundPalette", BackgroundPalette, null);
} catch (e) {
    console.error("Error initializing ROM library: " + e);
}

// TODO: is this nice? it looks not nice.
Rom.Rom();

// start opening the data file
var oReq = new XMLHttpRequest();
oReq.open("GET", "src/bgs.dat", true);
oReq.responseType = "arraybuffer";

oReq.onload = function (oEvent) {
  var arrayBuffer = oReq.response;
  if (arrayBuffer) {
    // unlike Java, I don't need to read and convert this stream. woo!
    var byteArray = new Uint8Array(arrayBuffer);
    Rom.open(byteArray);
    setupEngine();
  }
}

oReq.send(null);

var setupEngine = exports.setupEngine = function setupEngine() {

  console.log("Starting engine...");

  var params = getJsonFromUrl();

  // default values
  var layer1_val = Number(params.layer1) || 221;
  var layer2_val = Number(params.layer2) || 222;

  console.log("Creating layer 1: " + layer1_val);
  var layer1 = new BackgroundLayer.BackgroundLayer(Rom, layer1_val);

  console.log("Creating layer 2: " + layer2_val);
  var layer2 = new BackgroundLayer.BackgroundLayer(Rom, layer2_val);

  var frameskip = 3;
  var aspectRatio = 16;

  var fps = 10;
  var alpha = parseFloat(0.5);

  if (layer2.getEntry() == 0)
    alpha = parseFloat(1.0);

  Engine.start(layer1, layer2, fps, aspectRatio, frameskip, alpha);
}

});
