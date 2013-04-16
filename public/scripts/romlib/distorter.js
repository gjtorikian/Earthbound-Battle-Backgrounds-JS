define(function(require, exports, module) {

var Distorter = exports.Distorter = function() {
    // There is some redundancy here: 'effect' is currently what is used
    // in computing frames, although really there should be a list of
    // four different effects ('dist') which are used in sequence.
    //
    // 'dist' is currently unused, but ComputeFrame should be changed to
    // make use of it as soon as the precise nature of effect sequencing
    // can be determined.
    //
    // The goal is to make Distorter a general-purpose BG effect class that
    // can be used to show either a single distortion effect, or to show the
    // entire sequence of effects associated with a background entry (including
    // scrolling and Palette animation, which still need to be implemented).
    //
    // Also note that "current_dist" should not be used. Distorter should be
    // a "temporally stateless" class, meaning that all temporal effects should
    // be computed at once, per request, rather than maintaining an internal
    // tick count. (The idea being that it should be fast to compute any
    // individual
    // frame. Since it is certainly possible to do this, there is no sense
    // requiring that all previous frames be computed before any given desired
    // frame.)

    this.effect = new this.DistortionEffect;

    // TODO: new this.DistortionEffect[4] did not work, is this appropriate?
    this.dist = [new this.DistortionEffect(), new this.DistortionEffect(),
                 new this.DistortionEffect(), new this.DistortionEffect()];
    this.current_dist = 1

    this.bmpSrc = null;

    return this;
};

(function(){

    exports.getDistortions = function() {
        return this.dist;
    }

    exports.getCurrentDistortion = function() {
        return this.dist[this.current_dist];
    }

    exports.getEffect = function() {
        return this.effect;
    }

    exports.getEffectAsInt = function() {
        return this.effect.getDistortionEffect();
    }

    exports.setEffect = function(value) {
        this.effect = value;
    }

    exports.getOriginal = function() {
        return this.bmpSrc;
    }

    exports.setOriginal = function(value) {
        this.src = value;
    }

    exports.overlayFrame = function(dst, letterbox, ticks, alpha, erase) {
        var e = erase ? 1 : 0;
        //ComputeFrame(dst, src, getEffectAsInt(), letterbox, ticks, alpha, e,
        //        effect.getAmplitude(), effect.getAmplitudeAcceleration(),
        //        effect.getFrequency(), effect.getFrequencyAcceleration(),
        //        effect.getCompression(), effect.getCompressionAcceleration(),
        //        effect.getSpeed());
    }

    exports.DistortionEffect = function() {
        var Type = {
            "Invalid": 0,
            "Horizontal": 1,
            "HorizontalInterlaced": 2,
            "Vertical": 3
        }

        var type;

        var ampl;
        var s_freq;
        var ampl_accel;
        var s_freq_accel;

        var start;
        var speed;

        var compr;
        var compr_accel;

        this.Type = function() {
            return Type;
        }

        this.getDistortionEffect = function() {
            return Type[type];
        }

        /**
         * Gets or sets the type of distortion effect to use.
         */
        this.getEffect = function() {
            return type;
        }

        this.setEffect = function(value) {
            type = value;
        }

        /**
         * Gets or sets the amplitude of the distortion effect
         */
        this.getAmplitude = function() {
            return ampl;
        }

        this.setAmplitude = function(value) {
            ampl = value;
        }

        /**
         * Gets or sets the spatial frequency of the distortion effect
         */
        this.getFrequency = function() {
            return s_freq;
        }

        this.setFrequency = function(value) {
            s_freq = value;
        }

        /**
         * The amount to add to the amplitude value every iteration.
         */
        this.getAmplitudeAcceleration = function() {
            return ampl_accel;
        }

        this.setAmplitudeAcceleration = function(value) {
            ampl_accel = value;
        }

        /**
         * The amount to add to the frequency value each iteration.
         */
        this.getFrequencyAcceleration = function() {
            return s_freq_accel;
        }

        this.setFrequencyAcceleration = function(value) {
            s_freq_accel = value;
        }

        /**
         * Compression factor
         */
        this.getCompression = function() {
            return compr;
        }

        this.setCompression = function(value) {
            compr = value;
        }

        /**
         * Change in the compression value every iteration
         */
        this.getCompressionAcceleration = function() {
            return compr_accel;
        }

        this.setCompressionAcceleration = function(value) {
            compr_accel = value;
        }

        /**
         * Offset for starting time.
         */
        this.getStartTime = function() {
            return start;
        }

        this.setStartTime = function(value) {
            start = value;
        }

        /**
         * Gets or sets the "speed" of the distortion. 0 = no animation, 127 =
         * very fast, 255 = very slow for some reason
         */
        this.getSpeed = function() {
            return speed;
        }

        this.setSpeed = function(value) {
            speed = value;
        }

        return this;
    }

}).call(Distorter.prototype);

});