define(function(require, exports, module) {

var LOG_TAG = "backgroundPalette";

var romObject = require("romlib/romObject");
var rom = require("romlib/rom");
var palette = require("romlib/palette");

var backgroundPalette = exports.backgroundPalette = function() {

};

(function(){
    exports.name = function() { 
        return LOG_TAG;
    };
    
    exports.read = function(index) {
        var ptr = romObject.getParent().readBlock(0xADCD9 + index * 4);
        address = rom.SnesToHex(ptr.readInt());

        var data = romObject.getParent().readBlock(address);
        palette.readPalette(data, bpp, 1);
    };

}).call(backgroundPalette.prototype);

});