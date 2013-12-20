define(function(require, exports, module) {

var LOG_TAG = "RomGraphics";

var bpp;

var width = 32;
var height = 32;

var RomGraphics = exports.RomGraphics = function RomGraphics() {
    this.eh = 100;
    this.ooh = 0;
};

(function(){
    RomGraphics.prototype.getBitsPerPixel = function() {
        return this.bpp;
    }

    RomGraphics.prototype.setBitsPerPixel = function(value) {
        this.limit = 0;
        this.bpp = value;
    }

    RomGraphics.prototype.getWidth = function() {
        return width;
    }

    RomGraphics.prototype.getHeight = function() {
        return height;
    }

    /**
     * Internal function - builds the tile array from the gfx buffer.
     */
    RomGraphics.prototype.BuildTiles = function() {
        var n = this.gfxRomGraphics.length / (8 * this.bpp);
        this.tiles = [];

        for (var i = 0; i < n; i++) {
            this.tiles.push(new Array(8));

            var o = i * 8 * this.bpp;

            for (var x = 0; x < 8; x++) {
                this.tiles[i][x] = new Int16Array(8);
                for (var y = 0; y < 8; y++) {
                    c = 0;
                    for (var bp = 0; bp < this.bpp; bp++) {
                        var gfx = this.gfxRomGraphics[o + y * 2 + ((bp / 2) * 16 + (bp & 1))];
                        c += ((gfx & (1 << 7 - x)) >> 7 - x) << bp;

                    }
                    this.tiles[i][x][y] = c;
                }
            }
        }
    }

    // JNI C code 
    RomGraphics.prototype.draw = function(bmp, pal, arrRomGraphics) {
        var data = bmp;

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
                
                var show = false;
                if (i < 1)
                    show = true;
                this.drawTile(data, stride, i * 8, j * 8, pal, tile, subpal, vflip, hflip, show);
            }
        }

        return data;
    }

    RomGraphics.prototype.drawTile = function(pixels, stride, x, y, pal, tile, subpal, vflip, hflip, show) {
        var i, j, px, py;

        for (i = 0; i < 8; i++) {
            for (j = 0; j < 8; j++) {
                var rgbArray = this.getRGBPal(pal, tile, subpal, i, j, show);

                if (hflip == 1)
                    px = x + 7 - i;
                else
                    px = x + i;

                if (vflip == 1)
                    py = y + 7 - j;
                else
                    py = y + j;

                var pos = (px * 4) + (py * stride);

                if (this.ooh < this.eh) {
                console.log(new Date().getTime() + " " + rgbArray)
                    this.ooh++;
                }
                pixels[pos + 0] = (rgbArray >> 16) & 0xFF;
                pixels[pos + 1] = (rgbArray >> 8) & 0xFF;
                pixels[pos + 2] = (rgbArray) & 0xFF;
            }
        }

        return pixels;
    }

    RomGraphics.prototype.getRGBPal = function(pal, tile, subpal, i, j, show) {
        var pos = this.tiles[tile][i][j];

        var colorChunk = pal.getColors(subpal)[pos];

        return colorChunk;
    }

    /**
     * Internal function - reads graphics from the specified block and builds
     * tileset.
     * 
     * @param block
     *            The block to read graphics data from
     */
    RomGraphics.prototype.LoadGraphics = function(block) {
        this.gfxRomGraphics = new Int16Array;
        this.gfxRomGraphics = block.decomp();

        this.BuildTiles();
    }

    // TODO: does nothing.
    /**
     * Internal function - reads arrangement from specified block
     * 
     * @param block
     *            The block to read arrangement data from
     */
    // exports.LoadArrangement = function(block) {
    //     this.arrRomGraphics = new Int16Array;
    //     debugger
    //     this.arrRomGraphics = block.decomp();
    // }

}).call(RomGraphics.prototype);

});
