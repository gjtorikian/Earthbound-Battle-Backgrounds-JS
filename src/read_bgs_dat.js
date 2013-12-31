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
var xhr = new XMLHttpRequest();
xhr.open("GET", "src/bgs.dat", true);
xhr.responseType = "arraybuffer";

xhr.onload = function (oEvent) {
  // unlike Java, I don't need to read and convert this stream. woo!
  var byteArray = new Uint8Array(this.response);
  Rom.open(byteArray);
  setupEngine();
}

xhr.send();

var setupEngine = exports.setupEngine = function setupEngine() {
  console.log("Starting engine...");

  var params = getJsonFromUrl(), loader = null;

  // what is this second Number parse for? "0" is a valid number, but it yields false in the || statement!
  var layer1_val = Number(parseLayerParam(params.layer1) || 270);
  var layer2_val = Number(parseLayerParam(params.layer2) || 269);
  var frameskip = parseFrameskip(params.frameskip) || 3;
  var aspectRatio = Number(parseAspectRatioParam(params.aspectRatio) || 16);

  var fps = 10;
  var alpha = parseFloat(0.5);

  if (layer2_val == 0)
    alpha = parseFloat(1.0);

  console.log("Creating layer 1: " + layer1_val);
  var layer1 = new BackgroundLayer.BackgroundLayer(Rom, layer1_val);

  console.log("Creating layer 2: " + layer2_val);
  var layer2 = new BackgroundLayer.BackgroundLayer(Rom, layer2_val);

  document.getElementById("layer1").selectedIndex = layer1_val + 1;
  document.getElementById("layer2").selectedIndex = layer2_val + 1;
  document.getElementById("frameskip").selectedIndex = frameskip - 1;
  document.getElementById("aspectRatio").selectedIndex = ratioValues[String(aspectRatio)];
  document.getElementById("randomLayer").onclick = randomLayer;
  document.getElementById("randomLayer").onkeydown = randomLayer;

  if (loader = document.getElementById("loading-indicator"))
    loader.parentNode.removeChild(loader);

  Engine.start(layer1, layer2, fps, aspectRatio, frameskip, alpha);
}

});
