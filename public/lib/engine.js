define(function(require, exports, module) {

var BackgroundLayer = require("romlib/backgroundLayer");

var Engine = exports.Engine = function() {
  this.id = -1;
};

(function() {
  var c = document.getElementById("ebbb-holder");
  var ctx = c.getContext("2d");
  var canvasWidth = 256, canvasHeight = 256;

  // the animation loop
  exports.start = function(layer1, layer2, fps, aspectRatio, frameskip, alpha) {
    var tick = 0,
        imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight),
        then = Date.now(), startTime = then, elapsed,
        fpsInterval = 1000 / fps,
        bitmap;

    function krakenFrame() {
      this.id = requestAnimationFrame(krakenFrame);

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

    if (this.id > 0)
      window.cancelAnimationFrame(this.id);
    krakenFrame();
}

}).call(Engine.prototype);

});
