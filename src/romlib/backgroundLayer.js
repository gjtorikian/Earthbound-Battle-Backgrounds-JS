define(function(require, exports, module) {

var LOG_TAG = "BackgroundLayer";

var BackgroundGraphics = require("romlib/backgroundGraphics");
var Distorter = require("romlib/distorter");

var H = 256;
var W = 256;

var BackgroundLayer = exports.BackgroundLayer = function BackgroundLayer(src, entry) {
  this.gfx = null,
  this.pal = null,
  this.distort = new Distorter.Distorter(),
  this.loadEntry(src, entry);

  return this;
};

(function(){

  /**
   * The index of the layer entry that was loaded
   */
  BackgroundLayer.prototype.getEntry = function() {
    return this.entry;
  }

  BackgroundLayer.prototype.getBitmap = function() {
    return this.bmp;
  }

  BackgroundLayer.prototype.getDistorter = function() {
    return this.distort;
  }

  /**
   * Renders a frame of the background animation into the specified Bitmap
   *
   * @param dst
   *            Bitmap object into which to render
   * @param letterbox
   *            Size in pixels of black borders at top and bottom of image
   * @param ticks
   *            Time value of the frame to compute
   * @param alpha
   *            Blending opacity
   * @param erase
   *            Whether or not to clear the destination bitmap before
   *            rendering
   */
  BackgroundLayer.prototype.overlayFrame = function(dst, letterbox, ticks, alpha, erase) {
    return this.distort.overlayFrame(dst, letterbox, ticks, alpha, erase);
  }

  // TODO technically these shouldn't be exported--they're internal
  BackgroundLayer.prototype.loadGraphics = function(src, n) {
    this.gfx = src.getObjectByType("BackgroundGraphics", n);
  }

  BackgroundLayer.prototype.loadPalette = function(src, n) {
    this.pal = src.getObjectByType("BackgroundPalette", n);
  }

  BackgroundLayer.prototype.loadEffect = function(src, n) {
    var effect = src.getObjectByType("BattleBGEffect", n);

    this.distort.effect.setAmplitude(effect.getAmplitude());
    this.distort.effect.setAmplitudeAcceleration(
            effect.getAmplitudeAcceleration());
    this.distort.effect.setCompression(effect.getCompression());
    this.distort.effect.setCompressionAcceleration(
            effect.getCompressionAcceleration());
    this.distort.effect.setFrequency(effect.getFrequency());
    this.distort.effect.setFrequencyAcceleration(
            effect.getFrequencyAcceleration());
    this.distort.effect.setSpeed(effect.getSpeed());

    if (effect.getType() == 1)
        this.distort.effect.setEffect(this.distort.effect.Type().Horizontal);
    else if (effect.getType() == 3)
        this.distort.effect.setEffect(this.distort.effect.Type().Vertical);
    else
        this.distort.effect.setEffect(this.distort.effect.Type().HorizontalInterlaced);
  }

  BackgroundLayer.prototype.loadEntry = function(src, n) {
    this.entry = n;
    var bg = src.getObjectByTypename("BattleBG", n);

    // Set graphics / Palette
    this.loadGraphics(src, bg.getGraphicsIndex());
    this.loadPalette(src, bg.getPaletteIndex());

    var e = bg.getAnimation();

    var e1 = ( (e >> 24) & 0xFF);
    var e2 = ( (e >> 16) & 0xFF);
    var e3 = ( (e >> 8) & 0xFF);
    var e4 = ( (e) & 0xFF);

    if (e2 != 0)
        this.loadEffect(src, e2);
    else
        this.loadEffect(src, e1);

    this.initializeBitmap();
  }

  BackgroundLayer.prototype.initializeBitmap = function() {
    var pixels = new Int16Array(256 * 256 * 4);
    pixels = this.gfx.draw(pixels, this.pal)
    this.distort.setOriginal(pixels);
  }
}).call(BackgroundLayer.prototype);

});
