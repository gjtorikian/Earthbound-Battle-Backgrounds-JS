define(function(require, exports, module) {

var LOG_TAG = "BattleBGEffect";
var dataBBGE = new Int16Array(17);
var BattleBGEffect = exports.BattleBGEffect = function() {


};

(function() {
    exports.name = this.name = function() { 
        return LOG_TAG;
     };

    exports.getType = function() {
        return dataBBGE[2];
    };

    exports.setType = function(value) {
        dataBBGE[2] = value;
    }

    exports.getDuration = function() {
        return (dataBBGE[0] + (dataBBGE[1] << 8));
    }

    exports.setDuration = function(value) {
        dataBBGE[0] = value;
        dataBBGE[1] = (value >> 8);
    }

    exports.getFrequency = function() {
        return (dataBBGE[3] + (dataBBGE[4] << 8));
    }

    exports.setFrequency = function(value) {
        dataBBGE[3] = value;
        dataBBGE[4] = (value >> 8);
    }

    exports.getAmplitude = function() {
        return (dataBBGE[5] + (dataBBGE[6] << 8));
    }

    exports.setAmplitude = function(value) {
        dataBBGE[5] = value;
        dataBBGE[6] = (value >> 8);
    }

    exports.getCompression = function() {
        return (dataBBGE[8] + (dataBBGE[9] << 8));
    }

    exports.setCompression = function(value) {
        dataBBGE[8] = value;
        dataBBGE[9] = (value >> 8);
    }

    exports.getFrequencyAcceleration = function() {
        return (dataBBGE[10] + (dataBBGE[11] << 8));
    }

    exports.setFrequencyAcceleration = function(value) {
        dataBBGE[10] = value;
        dataBBGE[11] = (value >> 8);
    }

    exports.getAmplitudeAcceleration = function() {
        return (dataBBGE[12] + (dataBBGE[13] << 8));
    }

    exports.setAmplitudeAcceleration = function(value) {
        dataBBGE[12] = value;
        dataBBGE[13] = (value >> 8);
    }

    exports.getSpeed = function() {
        return dataBBGE[14];
    }

    exports.setSpeed = function(value) {
        dataBBGE[14] = value;
    }

    exports.getCompressionAcceleration = function() {
        return (dataBBGE[15] + (dataBBGE[16] << 8));
    }

    exports.setCompressionAcceleration = function(value) {
        dataBBGE[15] = value;
        dataBBGE[16] = (value >> 8);
    }

    this.read = function(index) {
        var main = this.getParent().readBlock(0x0AF908 + index * 17);

        for (var i = 0; i < 17; i++) {
            dataBBGE[i] = main.readShort();
        }
    };

    this.setParent = function(value) {
        this.parent = value;
    }

    this.getParent = function(value) {
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