define(function(require, exports, module) {

  // 20160105: OO-style animation controller, mostly to persist
  //           things that can or need to be preserved between calls to .start()
  //           like canvas, bitmap, timeout/animframe handles
  var EB_Animator = exports.EB_Animator = function EB_Animator() {

    this.hTimeout = false;
    this.hFrame   = false;

    this.tick   = 0;
    this.bitmap = null;

    this.canvas = document.getElementById("ebbb-holder");
    this.ctx    = this.canvas.getContext("2d");

    // NOTE: THESE ARE THE PIXEL DIMENSIONS WITHIN THE CANVAS --
    //       DIFFERENT FROM THE STYLE DIMENSIONS THAT SET THE CANVAS SIZE ON THE PAGE
    // SET EXPLICITLY TO MATCH SOURCE TILING
    this.canvas.width  = 256;
    this.canvas.height = 224;

    // 20160105: SUPERFLUOUS DUE TO CLEAR FLAG ON FIRST overlayFrame()
    //this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

    return this;
  };

  (function() {

    // 20160105: requestAnimationFrame passes a high-resolution timestamp
    //           parameter to supplied callback.  oTSHighRes is it.
    EB_Animator.prototype.krakenFrame = function( oTSHighRes ) {

    /*
    // exports ???
    // call

     CanvasRenderingContext2D.globalAlpha
     CanvasRenderingContext2D.drawImage
     sin warp horz
     overlay
     color cycle
    */
      var oThis = this;

      this.layer1.overlayFrame(
        this.imageData.data,
        this.aspectRatio,
        this.tick,
        this.alpha,
        true
      );

      this.layer2.overlayFrame(
        this.imageData.data,
        this.aspectRatio,
        this.tick,
        parseFloat(0.5),
        false
      );

      this.tick += this.frameskip;

      this.ctx.putImageData(this.imageData, 0, 0);

      // 20160105: USE setTimeout INSTEAD OF TIMESTAMP ARITHMETIC TO
      //           THROTTLE FPS FOR requestAnimationFrame
      //           [lighter on cpu cycles than the spinlock-lite it replaced]
      this.hTimeout = setTimeout( function() {

        this.hFrame = window.requestAnimationFrame( function(tsHR) {
          oThis.krakenFrame(tsHR);
        });

      }, 1000 / this.fps);
    };

    // LOAD/UPDATE ANIMATION PARAMETERS AND RESTART ANIMATION
    EB_Animator.prototype.start = function(layer1, layer2, fps, aspectRatio, frameskip, alpha) {

      this.tick = 0;

      this.layer1      = layer1;
      this.layer2      = layer2;
      this.fps         = fps;
      this.aspectRatio = aspectRatio;
      this.frameskip   = frameskip;
      this.alpha       = alpha;

      // PREVENT CREATION OF MULTIPLE RENDER CALLBACK CYCLES ON PARAMETER CHANGE
      if( this.hTimeout !== false ) {

        window.clearTimeout(this.hTimeout);
        this.hTimeout = false;
      }

      if( this.hFrame !== false ) {

        window.cancelAnimationFrame(this.hFrame);
        this.hFrame = false;
      }

      this.krakenFrame();
    }

  }).call(EB_Animator.prototype);

});
