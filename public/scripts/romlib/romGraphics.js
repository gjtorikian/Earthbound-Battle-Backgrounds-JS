define(function(require, exports, module) {

var LOG_TAG = "RomGraphics";

var arrRomGraphics = new Int16Array;
var gfxRomGraphics = new Int16Array;
var bpp;

var width = 32;
var height = 32;

var STRIDE = 64;

var RomGraphics = exports.RomGraphics = function(name, age) {

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

    // JNI C code 
    exports.draw = function(ctx, bmp, pal, arrRomGraphics) {
        var buffer = new ArrayBuffer(bmp.data.length);
        var buf8 = new Uint8ClampedArray(buffer);
        var data = new Uint32Array(buffer);

        var block = 0, tile = 0, subpal = 0;
        var i = 0, j = 0, n = 0, b1 = 0, b2 = 0;
        var vflip = false, hflip = false;

        // for each pixel in the 256x256 grid, we need to render the image found in the .dat file
        for (i = 0; i < 32; i++)
        {
            for (j = 0; j < 32; j++)
            {
                n = j * 32 + i;

                b1 = buffer[n * 2];
                b2 = buffer[n * 2 + 1] << 8;
                block = b1 + b2;

                tile = block & 0x3FF;
                vflip = (block & 0x8000) != 0;
                hflip = (block & 0x4000) != 0;
                subpal = (block >> 10) & 7;
            
                var line = this.drawTile(data, i * 8, j * 8, pal, tile, subpal, vflip, hflip);
                bmp.data.set(data);
                ctx.putImageData(bmp, 0, 0);
            }
        }

        
        //bmp.data.set(buf8);
        
        //ctx.putImageData(bmp, 0, 0);
    }

    exports.drawTile = function(pixels, x, y, pal, tile, subpal, vflip, hflip) {
        var  i, j, px, py;
        var line = pixels;

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

                var pos = (px * 4) + (py * STRIDE);
                
                pixels[pos + 0] = (rgbArray >> 16) & 0xFF;
                pixels[pos + 1] = (rgbArray >> 8) & 0xFF;
                pixels[pos + 2] = (rgbArray) & 0xFF;
                //line[pos + 3] = 0;
            }
        }

        return line;
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

}).call(RomGraphics.prototype);

});
