define(function(require, exports, module) {

var LOG_TAG = "RomGraphics";

var bpp;

var width = 32;
var height = 32;

var RomGraphics = exports.RomGraphics = function(name, age) {

};

(function(){
    exports.getBitsPerPixel = function() {
        return this.bpp;
    }

    exports.setBitsPerPixel = function(value) {
        this.bpp = value;
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
    exports.BuildTiles = function() {
        var n = this.gfxRomGraphics.length / (8 * this.bpp);

        this.tiles = [];

        for (i = 0; i < n; i++) {
            this.tiles.push(new Array(8));

            o = i * 8 * this.bpp;

            for (x = 0; x < 8; x++) {
                this.tiles[i][x] = new Int16Array(8);
                for (y = 0; y < 8; y++) {
                    c = 0;
                    for (bp = 0; bp < this.bpp; bp++) {
                        var gfx = this.gfxRomGraphics[o + y * 2
                                + ((bp / 2) * 16 + (bp & 1))];

                        c += ((gfx & (1 << 7 - x)) >> 7 - x) << bp;

                    }
                    this.tiles[i][x][y] = c;
                }
            }
        }
    }

    // JNI C code 
    exports.draw = function(bmp, pal, arrRomGraphics) {
        var data = bmp.data; 
        var block = 0, tile = 0, subpal = 0;
        var i = 0, j = 0, n = 0, b1 = 0, b2 = 0;
        var vflip = false, hflip = false;

        // TODO: hardcoding is bad.
        var stride = 1024;

        // for each pixel in the 256x256 grid, we need to render the image found in the .dat file
        for (i = 0; i < 32; i++)
        {
            for (j = 0; j < 32; j++)
            {
                n = j * 32 + i;

                b1 = arrRomGraphics[n * 2];
                b2 = arrRomGraphics[n * 2 + 1] << 8;
                block = b1 + b2;

                tile = block & 0x3FF;
                vflip = (block & 0x8000) != 0;
                hflip = (block & 0x4000) != 0;
                subpal = (block >> 10) & 7;
            
                this.drawTile(data, stride, i * 8, j * 8, pal, tile, subpal, vflip, hflip);
            }
        }

        return bmp;
    }

    exports.drawTile = function(pixels, stride, x, y, pal, tile, subpal, vflip, hflip) {
        var  i, j, px, py;

        for (i = 0; i < 8; i++) {
            for (j = 0; j < 8; j++) {
                var rgbArray = this.getRGBPal(pal, tile, subpal, i, j);

                if (hflip == 1)
                    px = x + 7 - i;
                else
                    px = x + i;

                if (vflip == 1)
                    py = y + 7 - j;
                else
                    py = y + j;

                var pos = (px * 4) + (py * stride);
                
                pixels[pos + 0] = Math.round(255 * Math.random()); //(rgbArray >> 16) & 0xFF;
                pixels[pos + 1] = Math.round(255 * Math.random()); //(rgbArray >> 8) & 0xFF;
                pixels[pos + 2] = Math.round(255 * Math.random()); //(rgbArray) & 0xFF;
                //pixels[pos + 3] = 0;
            }
        }

        return pixels;
    }

    exports.getRGBPal = function(pal, tile, subpal, i, j) {
        var pos = this.tiles[tile][i][j];
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
    exports.LoadGraphics = function(block) {
        this.gfxRomGraphics = new Int16Array;
        this.gfxRomGraphics = block.decomp();

        this.BuildTiles();
    }

    /**
     * Internal function - reads arrangement from specified block
     * 
     * @param block
     *            The block to read arrangement data from
     */
    exports.LoadArrangement = function(block) {
        this.arrRomGraphics = new Int16Array;
        this.arrRomGraphics = block.decomp();
    }

}).call(RomGraphics.prototype);

});
