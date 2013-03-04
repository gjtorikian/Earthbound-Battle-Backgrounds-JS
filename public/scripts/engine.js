define(function(require, exports, module) {

var BackgroundLayer = require("romlib/backgroundLayer");

var Engine = exports.Engine = function() {

};

(function(){

	exports.start = function() {
		console.log("Starting engine...");

        var layer1_val = 270;
        var layer2_val = 269;

		console.log("Creating layer 1: " + layer1_val);
		layer1 = BackgroundLayer.BackgroundLayer(Rom, layer1_val);

		console.log("Creating layer 2: " + layer2_val);
		layer2 = BackgroundLayer.BackgroundLayer(Rom, layer2_val);

        var frameskip = 3;
        var aspectRatio = 16;	

		var canvas = document.getElementById("canvas");
		var canvasWidth  = canvas.width;
		var canvasHeight = canvas.height;
		var ctx = canvas.getContext("2d");

		var fps = 15;

		function krakenFrame() {
		    setTimeout(function() {
		    	requestAnimationFrame(krakenFrame);
				var imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

				var buf = new ArrayBuffer(imageData.data.length);
				var buf8 = new Uint8ClampedArray(buf);
				var data = new Uint32Array(buf);

				for (var y = 0; y < canvasHeight; ++y) {
				    for (var x = 0; x < canvasWidth; ++x) {
				        var value = x * y & 0xff;
				        var randomnumber=Math.floor(Math.random()*25)
				        data[y * canvasWidth + x] =
				            (255   << randomnumber) |    // alpha
				            (value << randomnumber) |    // blue
				            (value <<  randomnumber) |    // green
				             value;            // red
				    }
				}

				imageData.data.set(buf8);

				ctx.putImageData(imageData, 0, 0);
		    }, 1000 / fps);
		}

		krakenFrame();
	}

}).call(Engine.prototype);

});