define(function(require, exports, module) {

var BackgroundLayer = require("romlib/backgroundLayer");

var Engine = exports.Engine = function() {

};

(function(){
	var c = document.getElementById("canvas");
	var ctx = c.getContext("2d");
	var canvasWidth = 256, canvasHeight = 256;
	exports.start = function(layer1, layer2, fps, aspectRatio, frameskip, alpha) {

    var tick = 0;
		var imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
		var then = Date.now(), startTime = then, elapsed;
		var fpsInterval = 1000 / fps;

		function krakenFrame() {
		    	requestAnimationFrame(krakenFrame);
		    // setTimeout(function() {
		    	var now = Date.now();
		    	elapsed = now - then;
		    	// console.log("Rendering tick " + tick);
			    if (elapsed > fpsInterval) {
			    		then = now - (elapsed % fpsInterval);
				    	var bitmap = layer1.overlayFrame(imageData.data, aspectRatio, tick, alpha, true);
					    bitmap = layer2.overlayFrame(bitmap, aspectRatio, tick, parseFloat(0.5), false);
							
					    tick += (frameskip);

							imageData.data.set(bitmap);

							ctx.putImageData(imageData, 0, 0);
			    }
			    // }, 9000 / fps);
		}

		krakenFrame();
	}

}).call(Engine.prototype);

});