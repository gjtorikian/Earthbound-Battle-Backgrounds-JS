define(function(require, exports, module) {
"use strict";

var Rom = require("romlib/rom");

var BattleBGEffect = require("pkhack/battleBGEffect");
var BattleBG = require("pkhack/battleBG");

var BackgroundGraphics = require("romlib/backgroundGraphics");
var BackgroundPalette = require("romlib/backgroundPalette");
var BackgroundLayer = require("romlib/backgroundLayer");

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

// ugghhhhhhhhh
var ratioValues = { '0': 0, '16': 1, '48': 2, '64': 3}

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

  var layer1_val = parseLayerParam(params.layer1) || 270;
  var layer2_val = parseLayerParam(params.layer2) || 269;

  console.log("Creating layer 1: " + layer1_val);
  var layer1 = new BackgroundLayer.BackgroundLayer(Rom, layer1_val);

  console.log("Creating layer 2: " + layer2_val);
  var layer2 = new BackgroundLayer.BackgroundLayer(Rom, layer2_val);

  var frameskip = parseFrameskip(params.frameskip) || 3;
  var aspectRatio = parseAspectRatioParam(params.aspectRatio) || 16;

  var fps = 10;
  var alpha = parseFloat(0.5);

  if (layer2.getEntry() == 0)
    alpha = parseFloat(1.0);

  document.getElementById("layer1").selectedIndex = layer1_val;
  document.getElementById("layer2").selectedIndex = layer2_val;
  document.getElementById("frameskip").selectedIndex = frameskip - 1;
  document.getElementById("aspectRatio").selectedIndex = ratioValues[String(aspectRatio)];
  document.getElementById("randomLayer").onclick = randomLayer;
  document.getElementById("randomLayer").onkeydown = randomLayer;

  Engine.start(layer1, layer2, fps, aspectRatio, frameskip, alpha);
}

});
