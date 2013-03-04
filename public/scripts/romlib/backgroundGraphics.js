define(function(require, exports, module) {

var romGraphics = require("romlib/romgraphics");
var rom = require("romlib/rom");

var LOG_TAG = "backgroundGraphics";

var backgroundGraphics = exports.backgroundGraphics = function(name, age) {


};

(function(){
    exports.name = function() { 
        return LOG_TAG;
    };
    
    exports.read = function(index) {
        // Graphics pointer table entry
        var gfxPtrBlock = romGraphics.getParent().readBlock(0xAD9A1 + index * 4);
        // int gfxPtr = Rom.SnesToHex(gfxPtrBlock.readInt());

        // Read graphics
        romGraphics.LoadGraphics(romGraphics.getParent()
                .readBlock(rom.SnesToHex(gfxPtrBlock.readInt())));

        // Arrangement pointer table entry
        var arrPtrBlock = romGraphics.getParent().readBlock(0xADB3D + index * 4);
        var arrPtr = rom.SnesToHex(arrPtrBlock.readInt());

        // Read and decompress arrangement
        var arrBlock = romGraphics.getParent().readBlock(arrPtr);
        arrRomGraphics = arrBlock.decomp();
    };

}).call(backgroundGraphics.prototype);

});