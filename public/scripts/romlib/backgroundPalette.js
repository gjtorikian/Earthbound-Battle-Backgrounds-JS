define(function(require, exports, module) {

var LOG_TAG = "BackgroundPalette";

var RomObject = require("romlib/RomObject");
var Rom = require("romlib/Rom");
var Palette = require("romlib/Palette");

var BackgroundPalette = exports.BackgroundPalette = function() {

};

(function(){
    exports.name = function() { 
        return LOG_TAG;
    };
    
    exports.read = function(index) {
        var ptr = RomObject.getParent().readBlock(0xADCD9 + index * 4);
        address = Rom.SnesToHex(ptr.readInt());

        var data = RomObject.getParent().readBlock(address);
        Palette.readPalette(data, bpp, 1);
    };

}).call(BackgroundPalette.prototype);

});