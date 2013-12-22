define(function(require, exports, module) {

var DistortionEffect = exports.DistortionEffect = function DistortionEffect() {
    this.Type = {
        "Invalid": 0,
        "Horizontal": 1,
        "HorizontalInterlaced": 2,
        "Vertical": 3
    }

    this.type = null;
};

(function(){

    exports.Type = function() {
        return this.Type;
    }

    exports.getDistortionEffect = function() {
        return this.Type[this.type];
    }

    /**
     * Gets or sets the type of distortion effect to use.
     */
    exports.getEffect = function() {
        return this.type;
    }

    exports.getEffectAsInt = function() {
        return this.getDistortionEffect();
    }

    exports.setEffect = function(value) {
        this.type = value;
    }

    /**
     * Gets or sets the amplitude of the distortion effect
     */
    exports.getAmplitude = function() {
        return ampl;
    }

    exports.setAmplitude = function(value) {
        ampl = value;
    }

    /**
     * Gets or sets the spatial frequency of the distortion effect
     */
    exports.getFrequency = function() {
        return s_freq;
    }

    exports.setFrequency = function(value) {
        s_freq = value;
    }

    /**
     * The amount to add to the amplitude value every iteration.
     */
    exports.getAmplitudeAcceleration = function() {
        return ampl_accel;
    }

    exports.setAmplitudeAcceleration = function(value) {
        ampl_accel = value;
    }

    /**
     * The amount to add to the frequency value each iteration.
     */
    exports.getFrequencyAcceleration = function() {
        return s_freq_accel;
    }

    exports.setFrequencyAcceleration = function(value) {
        s_freq_accel = value;
    }

    /**
     * Compression factor
     */
    exports.getCompression = function() {
        return compr;
    }

    exports.setCompression = function(value) {
        compr = value;
    }

    /**
     * Change in the compression value every iteration
     */
    exports.getCompressionAcceleration = function() {
        return compr_accel;
    }

    exports.setCompressionAcceleration = function(value) {
        compr_accel = value;
    }

    /**
     * Offset for starting time.
     */
    exports.getStartTime = function() {
        return start;
    }

    exports.setStartTime = function(value) {
        start = value;
    }

    /**
     * Gets or sets the "speed" of the distortion. 0 = no animation, 127 =
     * very fast, 255 = very slow for some reason
     */
    exports.getSpeed = function() {
        return speed;
    }

    exports.setSpeed = function(value) {
        speed = value;
    }
}).call(DistortionEffect.prototype);

});