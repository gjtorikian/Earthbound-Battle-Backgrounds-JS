define(function(require, exports, module) {

var BackgroundLayer = require("romlib/backgroundLayer");

var Engine = exports.Engine = function() {

};

(function(){

	exports.start = function(layer1, layer2, tick, fps, aspectRatio, frameskip, alpha) {

		function krakenFrame() {
		    setTimeout(function() {
		    	//console.log("Rendering " + tick)
		    	requestAnimationFrame(krakenFrame);

		    	layer1.overlayFrame(layer1.getBitmap(), aspectRatio, tick, alpha, true);
			    layer2.overlayFrame(layer2.getBitmap(), aspectRatio, tick, parseFloat(0.5), false);

			    tick += (frameskip);

				// var imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

				// var buf = new ArrayBuffer(imageData.data.length);
				// var buf8 = new Uint8ClampedArray(buf);
				// var data = new Uint32Array(buf);

				// for (var y = 0; y < canvasHeight; ++y) {
				//     for (var x = 0; x < canvasWidth; ++x) {
				//         var value = x * y & 0xff;
				//         var randomnumber=Math.floor(Math.random()*25)
				//         data[y * canvasWidth + x] =
				//             (255   << randomnumber) |    // alpha
				//             (value << randomnumber) |    // blue
				//             (value <<  randomnumber) |    // green
				//              value;            // red
				//     }
				// }

				// imageData.data.set(buf8);

				// ctx.putImageData(imageData, 0, 0);
		    }, 1000 / fps);
		}

		krakenFrame();
	}

}).call(Engine.prototype);

});