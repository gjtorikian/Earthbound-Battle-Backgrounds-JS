define(function(require, exports, module) {

var LOG_TAG = "romGraphics";

var arrRomGraphics = new Int16Array;
var gfxRomGraphics = new Int16Array;
var bpp;

var width = 32;
var height = 32;

var romGraphics = exports.romGraphics = function(name, age) {

};

(function(){
    exports.getBitsPerPixel = function() {
        return bpp;
    }

    exports.setBitsPerPixel = function(value) {
        bpp = value;
    }

    exports.getWidth = function() {
        return width;
    }

    exports.getHeight = function() {
        return height;
    }

    /**
     * Internal function - builds the tile array from the gfx buffer.
     */
    function BuildTiles() {
        var n = gfxRomGraphics.length / (8 * bpp);

        tiles = [];

        for (i = 0; i < n; i++) {
            tiles.push(new Int16Array[8]);

            o = i * 8 * bpp;

            for (x = 0; x < 8; x++) {
                tiles[i][x] = new Int16Array[8];
                for (y = 0; y < 8; y++) {
                    c = 0;
                    for (bp = 0; bp < bpp; bp++) {
                        var gfx = gfxRomGraphics[o + y * 2
                                + ((bp / 2) * 16 + (bp & 1))];

                        c += ((gfx & (1 << 7 - x)) >> 7 - x) << bp;

                    }
                    tiles[i][x][y] = c;
                }
            }
        }
    }

    exports.draw = function(bmp, pal) {
        DrawInC(bmp, pal, arrRomGraphics, arrRomGraphics.length);
    }

    exports.getRGBPal = function(pal, tile, subpal, i, j) {
        var pos = tiles[tile][i][j];
        var colorChunk = pal.getColors(subpal)[pos];

        // final int r = Color.red(colorChunk);
        // final int g = Color.green(colorChunk);
        // final int b = Color.blue(colorChunk);

        // return new int[] { r, g, b };
        return colorChunk;
    }

    /**
     * Internal function - reads graphics from the specified block and builds
     * tileset.
     * 
     * @param block
     *            The block to read graphics data from
     */
    function LoadGraphics(block) {
        gfxRomGraphics = block.decomp();

        BuildTiles();
    }

    /**
     * Internal function - reads arrangement from specified block
     * 
     * @param block
     *            The block to read arrangement data from
     */
    function LoadArrangement(block) {
        arrRomGraphics = block.decomp();
    }

}).call(romGraphics.prototype);

});
