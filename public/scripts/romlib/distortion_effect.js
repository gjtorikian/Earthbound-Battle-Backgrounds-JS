define(function(require, exports, module) {

// N.B. it's important to set the types as "short," so Int16Array works fine enough
var DistortionEffect = exports.DistortionEffect = function DistortionEffect() {
  this.type = null;
};

(function(){

  DistortionEffect.prototype.Type = function() {
    return {
    "Invalid": 0,
    "Horizontal": 1,
    "HorizontalInterlaced": 2,
    "Vertical": 3
    }
  }

  DistortionEffect.prototype.getDistortionEffect = function() {
    return this.Type();
  }

  /**
   * Gets or sets the type of distortion effect to use.
   */
  DistortionEffect.prototype.getEffect = function() {
    return this.type;
  }

  DistortionEffect.prototype.getEffectAsInt = function() {
    return this.type;
  }

  DistortionEffect.prototype.setEffect = function(value) {
    this.type = value;
  }

  /**
   * Gets or sets the amplitude of the distortion effect
   */
  DistortionEffect.prototype.getAmplitude = function() {
    return this.ampl[0];
  }

  DistortionEffect.prototype.setAmplitude = function(value) {
    this.ampl = new Int16Array(1);
    this.ampl[0] = value;
  }

  /**
   * Gets or sets the spatial frequency of the distortion effect
   */
  DistortionEffect.prototype.getFrequency = function() {
    return this.sFreq[0];
  }

  DistortionEffect.prototype.setFrequency = function(value) {
    this.sFreq = new Int16Array(1);
    this.sFreq[0] = value;
  }

  /**
   * The amount to add to the amplitude value every iteration.
   */
  DistortionEffect.prototype.getAmplitudeAcceleration = function() {
    return this.amplAccel[0];
  }

  DistortionEffect.prototype.setAmplitudeAcceleration = function(value) {
    this.amplAccel = new Int16Array(1);
    this.amplAccel[0] = value;
  }

  /**
   * The amount to add to the frequency value each iteration.
   */
  DistortionEffect.prototype.getFrequencyAcceleration = function() {
    return this.sFreqAccel[0];
  }

  DistortionEffect.prototype.setFrequencyAcceleration = function(value) {
    this.sFreqAccel = new Int16Array(1);
    this.sFreqAccel[0] = value;
  }

  /**
   * Compression factor
   */
  DistortionEffect.prototype.getCompression = function() {
    return this.compr[0];
  }

  DistortionEffect.prototype.setCompression = function(value) {
    this.compr = new Int16Array(1);
    this.compr[0] = value;
  }

  /**
   * Change in the compression value every iteration
   */
  DistortionEffect.prototype.getCompressionAcceleration = function() {
    return this.comprAccel[0];
  }

  DistortionEffect.prototype.setCompressionAcceleration = function(value) {
    this.comprAccel = new Int16Array(1);
    this.comprAccel[0] = value;
  }

  /**
   * Offset for starting time.
   */
  DistortionEffect.prototype.getStartTime = function() {
    return this.start;
  }

  DistortionEffect.prototype.setStartTime = function(value) {
    this.start = value;
  }

  /**
   * Gets or sets the "speed" of the distortion. 0 = no animation, 127 =
   * very fast, 255 = very slow for some reason
   */
  DistortionEffect.prototype.getSpeed = function() {
    return this.speed[0];
  }

  DistortionEffect.prototype.setSpeed = function(value) {
    this.speed = new Int16Array(1);
    this.speed[0] = value;
  }
}).call(DistortionEffect.prototype);

});
