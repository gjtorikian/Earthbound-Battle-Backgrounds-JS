define(function(require, exports, module) {

var LOG_TAG = "BattleBGEffect";

var BattleBGEffect = exports.BattleBGEffect = function BattleBGEffect() {
    this.dataBBGE = new Uint8Array(17);

    return this;
};

(function() {
  exports.name = this.name = function() {
    return LOG_TAG;
   };

  BattleBGEffect.prototype.getType = function() {
    return this.dataBBGE[2];
  };

  BattleBGEffect.prototype.setType = function(value) {
    this.dataBBGE[2] = value;
  }

  BattleBGEffect.prototype.getDuration = function() {
    return (this.dataBBGE[0] + (this.dataBBGE[1] << 8));
  }

  BattleBGEffect.prototype.setDuration = function(value) {
    this.dataBBGE[0] = value;
    this.dataBBGE[1] = (value >> 8);
  }

  BattleBGEffect.prototype.getFrequency = function() {
    return (this.dataBBGE[3] + (this.dataBBGE[4] << 8));
  }

  BattleBGEffect.prototype.setFrequency = function(value) {
    this.dataBBGE[3] = value;
    this.dataBBGE[4] = (value >> 8);
  }

  BattleBGEffect.prototype.getAmplitude = function() {
    return (this.dataBBGE[5] + (this.dataBBGE[6] << 8));
  }

  BattleBGEffect.prototype.setAmplitude = function(value) {
    this.dataBBGE[5] = value;
    this.dataBBGE[6] = (value >> 8);
  }

  BattleBGEffect.prototype.getCompression = function() {
    return (this.dataBBGE[8] + (this.dataBBGE[9] << 8));
  }

  BattleBGEffect.prototype.setCompression = function(value) {
    this.dataBBGE[8] = value;
    this.dataBBGE[9] = (value >> 8);
  }

  BattleBGEffect.prototype.getFrequencyAcceleration = function() {
    return (this.dataBBGE[10] + (this.dataBBGE[11] << 8));
  }

  BattleBGEffect.prototype.setFrequencyAcceleration = function(value) {
    this.dataBBGE[10] = value;
    this.dataBBGE[11] = (value >> 8);
  }

  BattleBGEffect.prototype.getAmplitudeAcceleration = function() {
    return (this.dataBBGE[12] + (this.dataBBGE[13] << 8));
  }

  BattleBGEffect.prototype.setAmplitudeAcceleration = function(value) {
    this.dataBBGE[12] = value;
    this.dataBBGE[13] = (value >> 8);
  }

  BattleBGEffect.prototype.getSpeed = function() {
    return this.dataBBGE[14];
  }

  BattleBGEffect.prototype.setSpeed = function(value) {
    this.dataBBGE[14] = value;
  }

  BattleBGEffect.prototype.getCompressionAcceleration = function() {
    return (this.dataBBGE[15] + (this.dataBBGE[16] << 8));
  }

  BattleBGEffect.prototype.setCompressionAcceleration = function(value) {
    this.dataBBGE[15] = value;
    this.dataBBGE[16] = (value >> 8);
  }

  BattleBGEffect.prototype.read = function(index) {
    var main = this.getParent().readBlock(0x0AF908 + index * 17);

    for (var i = 0; i < 17; i++) {
        this.dataBBGE[i] = main.readShort();
    }
  };

  BattleBGEffect.prototype.setParent = function(value) {
    this.parent = value;
  }

  BattleBGEffect.prototype.getParent = function(value) {
    return this.parent;
  }

  exports.Handler = function(Rom) {
    for (var i = 0; i < 135; i++) {
        var e = new BattleBGEffect();

        Rom.add(e);
        e.read(i);
    }
  }
}).call(BattleBGEffect.prototype);

});
