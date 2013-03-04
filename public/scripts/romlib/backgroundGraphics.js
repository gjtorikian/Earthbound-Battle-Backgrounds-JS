define(function(require, exports, module) {

var RomGraphics = require("romlib/romgraphics");
var Rom = require("romlib/Rom");

var LOG_TAG = "BackgroundGraphics";

var BackgroundGraphics = exports.BackgroundGraphics = function(name, age) {


};

(function(){
    exports.name = function() { 
        return LOG_TAG;
    };
    
    exports.read = function(index) {
        // Graphics pointer table entry
        var gfxPtrBlock = RomGraphics.getParent().readBlock(0xAD9A1 + index * 4);
        // int gfxPtr = Rom.SnesToHex(gfxPtrBlock.readInt());

        // Read graphics
        RomGraphics.LoadGraphics(RomGraphics.getParent()
                .readBlock(Rom.SnesToHex(gfxPtrBlock.readInt())));

        // Arrangement pointer table entry
        var arrPtrBlock = RomGraphics.getParent().readBlock(0xADB3D + index * 4);
        var arrPtr = Rom.SnesToHex(arrPtrBlock.readInt());

        // Read and decompress arrangement
        var arrBlock = RomGraphics.getParent().readBlock(arrPtr);
        arrRomGraphics = arrBlock.decomp();
    };

}).call(BackgroundGraphics.prototype);

});