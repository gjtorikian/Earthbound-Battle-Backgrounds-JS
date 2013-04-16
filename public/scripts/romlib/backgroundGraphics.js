define(function(require, exports, module) {

var RomGraphics = require("romlib/romgraphics");
var Rom = require("romlib/Rom");

var LOG_TAG = "BackgroundGraphics";

var BackgroundGraphics = exports.BackgroundGraphics = function() {
    this.parent = null;
    this.bpp = null;
    this.uniqueId();
    
    return this;
};

(function(){
    exports.name = function() { 
        return LOG_TAG;
    };
    
    exports.read = function(index) {
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
        arrRomGraphics = arrBlock.decomp();
    };

    exports.setParent = function(value) {
        this.parent = value;
    }

    exports.getParent = function(value) {
        return this.parent;
    }

    // TODO dedupe these from backgroundPalette
    /**
     * Gets or sets the bit depth of this Palette.
     */
    exports.getBitsPerPixel = function() {
        return bpp;
    }

    exports.setBitsPerPixel = function(value) {
        bpp = value;
    }

    exports.draw = function(ctx, bmp, pal) {
        RomGraphics.draw(ctx, bmp, pal, arrRomGraphics);
    }

    /**
     * Internal function - reads graphics from the specified block and builds
     * tileset.
     * 
     * @param block
     *            The block to read graphics data from
     */
    var $loadGraphics = function(block) {
        this.gfxRomGraphics = block.decomp();

        $buildTiles();
    }

    /**
     * Internal function - builds the tile array from the gfx buffer.
     */
    function $buildTiles() {
        var n = this.gfxRomGraphics.length / (8 * bpp);

        this.tiles = [];

        for (var i = 0; i < n; i++) {
            this.tiles.push(new Int16Array(8));
            var o = i * 8 * bpp;

            for (var x = 0; x < 8; x++) {
                this.tiles[i][x] = new Int16Array(8);
                for (var y = 0; y < 8; y++) {
                    var c = 0;
                    for (var bp = 0; bp < bpp; bp++) {
                        var gfx = this.gfxRomGraphics[o + y * 2
                                + ((bp / 2) * 16 + (bp & 1))];

                        c += ((gfx & (1 << 7 - x)) >> 7 - x) << bp;

                    }
                    this.tiles[i][x][y] =  c;
                }
            }
        }
    }
}).call(BackgroundGraphics.prototype);

});