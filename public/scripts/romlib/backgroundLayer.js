define(function(require, exports, module) {

var LOG_TAG = "BackgroundLayer";

var BackgroundGraphics = require("romlib/BackgroundLayer");
var Distorter = require("romlib/Distorter");

var H = 256;
var W = 256;

var BackgroundLayer = exports.BackgroundLayer = function(src, entry) {
    this.gfx = null, this.pal = null;
    this.distort = Distorter.Distorter();
    LoadEntry(src, entry);
};

(function(){

    /**
     * The index of the layer entry that was loaded
     */
    exports.getEntry = function() {
        return this.entry;
    }

    exports.getBitmap = function() {
        return this.bmp;
    }

    exports.getDistorter = function() {
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
    exports.overlayFrame = function(dst, letterbox, ticks, alpha, erase) {
        this.distort.overlayFrame(dst, letterbox, ticks, alpha, erase);
    }

    function loadGraphics(src, n) {
        this.gfx = src.GetObject("BackgroundGraphics", n);
    }

    function loadPalette(src, n) {
        this.pal = src.GetObject("BackgroundPalette", n);
    }

    function loadEffect(src, n) {
        var effect = src.getObject("BattleBGEffect", n);

        this.distort.getEffect().setAmplitude(effect.getAmplitude());
        this.distort.getEffect().setAmplitudeAcceleration(
                effect.getAmplitudeAcceleration());
        this.distort.getEffect().setCompression(effect.getCompression());
        this.distort.getEffect().setCompressionAcceleration(
                effect.getCompressionAcceleration());
        this.distort.getEffect().setFrequency(effect.getFrequency());
        this.distort.getEffect().setFrequencyAcceleration(
                effect.getFrequencyAcceleration());
        this.distort.getEffect().setSpeed(effect.getSpeed());

        if (effect.getType() == 1)
            this.distort.getEffect().setEffect(
                    Distorter.DistortionEffect.Type.Horizontal);
        else if (effect.getType() == 3)
            this.distort.getEffect().setEffect(
                    Distorter.DistortionEffect.Type.Vertical);
        else
            this.distort.getEffect().setEffect(
                    Distorter.DistortionEffect.Type.HorizontalInterlaced);
    }

    function loadEntry(src, n) {
        this.entry = n;
        var bg = src.getObject("BattleBG", n);

        // Set graphics / Palette
        loadGraphics(src, bg.getGraphicsIndex());
        loadPalette(src, bg.getPaletteIndex());

        var e = bg.getAnimation();

        var e1 = ( (e >> 24) & 0xFF);
        var e2 = ( (e >> 16) & 0xFF);
        var e3 = ( (e >> 8) & 0xFF);
        var e4 = ( (e) & 0xFF);

        if (e2 != 0)
            loadEffect(src, e2);
        else
            loadEffect(src, e1);

        initializeBitmap();
    }

    function initializeBitmap() {
        bmp = Bitmap.createBitmap(W, H, Bitmap.Config.ARGB_8888);
        this.gfx.Draw(bmp, this.pal);
        this.distort.setOriginal(bmp);
    }
}).call(BackgroundLayer.prototype);

});