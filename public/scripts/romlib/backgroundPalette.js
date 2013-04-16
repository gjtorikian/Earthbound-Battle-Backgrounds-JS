define(function(require, exports, module) {

var LOG_TAG = "BackgroundPalette";

var RomObject = require("romlib/RomObject");
var Rom = require("romlib/Rom");

var BackgroundPalette = exports.BackgroundPalette = function() {
	this.colors = null;
    this.bpp = null;
    this.uniqueId();
    
	return this;
};

(function(){
    exports.name = function() { 
        return LOG_TAG;
    };
    
    exports.read = function(index) {
        var ptr = this.getParent().readBlock(0xADCD9 + index * 4);
        address = Rom.snesToHex(ptr.readInt());

        var data = this.getParent().readBlock(address);
        this.readPalette(data, this.bpp, 1);
    };

    exports.setParent = function(value) {
        this.parent = value;
    }

    exports.getParent = function(value) {
        return this.parent;
    }

    /**
     * Gets an array of colors representing one of this Palette's subpalettes.
     * 
     * @param pal
     *            The index of the subpalette to retrieve.
     * 
     * @return An array containing the colors of the specified subpalette.
     */
    exports.getColors = function(pal) {
        return this.colors[pal];
    }

    exports.getColorMatrix = function() {
        return this.colors;
    }

    /**
     * Gets or sets the bit depth of this Palette.
     */
    exports.getBitsPerPixel = function() {
        return this.bpp;
    }

    exports.setBitsPerPixel = function(value) {
        this.bpp = value;
    }

    /**
     * Internal function - reads Palette data from the given block into this
     * Palette's colors array.
     * 
     * @param block
     *            Block to read Palette data from.
     * @param bpp
     *            Bit depth; must be either 2 or 4.
     * @param count
     *            Number of subpalettes to read.
     */
    exports.readPalette = function(block, bpp, count) {
        if (this.bpp != 2 && this.bpp != 4)
            throw new Error(
                    "Palette error: Incorrect color depth specified.");

        if (count < 1)
            throw new Error(
                    "Palette error: Must specify positive number of subpalettes.");

        this.colors = new Array(count);
        for (var pal = 0; pal < count; pal++) {
            this.colors[pal] = new Array(Math.pow(2, this.bpp));
            for (var i = 0; i < Math.pow(2, this.bpp); i++) {
                var clr16 = block.readDoubleShort();

                var b = (((clr16 >> 10) & 31) * 8);
                var g = (((clr16 >> 5) & 31) * 8);
                var r = ((clr16 & 31) * 8);

                // convert RGB to color int
                this.colors[pal][i] = 256*256*r+ 256*g+b;
            }
        }
    }
}).call(BackgroundPalette.prototype);

});