define(function(require, exports, module) {

var RomGraphics = require("romlib/romgraphics");
var Rom = require("romlib/Rom");

var LOG_TAG = "BackgroundGraphics";

var BackgroundGraphics = exports.BackgroundGraphics = function BackgroundGraphics() {
    this.arrRomGraphics = new Int16Array;
    this.parent = null;
    this.bpp = null;
    this.uniqueId();
    
    return this;
};

(function(){
    BackgroundGraphics.prototype.name = function() { 
        return LOG_TAG;
    };
    
    BackgroundGraphics.prototype.read = function(index) {
        // Graphics pointer table entry
        var gfxPtrBlock = this.getParent().readBlock(0xAD9A1 + index * 4);
        // int gfxPtr = Rom.SnesToHex(gfxPtrBlock.readInt());

        // Read graphics
        $loadGraphics(this.getParent()
                .readBlock(Rom.snesToHex(gfxPtrBlock.readInt())));

        // Arrangement pointer table entry
        var arrPtrBlock = this.getParent().readBlock(0xADB3D + index * 4);
        var arrPtr = Rom.snesToHex(arrPtrBlock.readInt());

        // Read and decompress arrangement
        var arrBlock = this.getParent().readBlock(arrPtr);
        this.arrRomGraphics = arrBlock.decomp();
    };

    BackgroundGraphics.prototype.setParent = function(value) {
        this.parent = value;
    }

    BackgroundGraphics.prototype.getParent = function(value) {
        return this.parent;
    }

    // TODO dedupe these from backgroundPalette
    /**
     * Gets or sets the bit depth of this Palette.
     */
    BackgroundGraphics.prototype.getBitsPerPixel = function() {
        return RomGraphics.getBitsPerPixel();
    }

    BackgroundGraphics.prototype.setBitsPerPixel = function(value) {
        RomGraphics.setBitsPerPixel(value);
    }

    BackgroundGraphics.prototype.draw = function(bmp, pal) {
        return RomGraphics.draw(bmp, pal, this.arrRomGraphics);
    }

    /**
     * Internal function - reads graphics from the specified block and builds
     * tileset.
     * 
     * @param block
     *            The block to read graphics data from
     */
    var $loadGraphics = function(block) {
        RomGraphics.LoadGraphics(block);
    }
}).call(BackgroundGraphics.prototype);

});