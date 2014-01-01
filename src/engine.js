define(function(require, exports, module) {

var BackgroundLayer = require("romlib/backgroundLayer");
var frameId = -1;
var Engine = exports.Engine = function() {

};

(function() {
  // the animation loop
  exports.start = function(layer1, layer2, fps, aspectRatio, frameskip, alpha) {
    var tick = 0,
        then = Date.now(), startTime = then, elapsed,
        fpsInterval = 1000 / fps,
        bitmap;

    var canvas = document.getElementById("ebbb-holder");
    var ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var canvasWidth = 256, canvasHeight = 256,
        imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

    function krakenFrame() {
      frameId = requestAnimationFrame(krakenFrame);

      var now = Date.now();
      elapsed = now - then;

      // console.log("Rendering tick " + tick);
      if (elapsed > fpsInterval) {
          then = now - (elapsed % fpsInterval);

          bitmap = layer1.overlayFrame(imageData.data, aspectRatio, tick, alpha, true);
          bitmap = layer2.overlayFrame(bitmap, aspectRatio, tick, parseFloat(0.5), false);

          tick += (frameskip);

          imageData.data.set(bitmap);

          ctx.putImageData(imageData, 0, 0);
      }
    }

    if (frameId > 0)
      window.cancelAnimationFrame(frameId);
    krakenFrame();
}

}).call(Engine.prototype);

});
