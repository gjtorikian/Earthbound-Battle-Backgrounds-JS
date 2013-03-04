define(function(require, exports, module) {

var Palette = exports.Palette = function(name, age) {
    this.colors = [];
    this.bpp = 8;
};

(function(){

    /**
     * Gets an array of colors representing one of this Palette's subpalettes.
     * 
     * @param pal
     *            The index of the subpalette to retrieve.
     * 
     * @return An array containing the colors of the specified subpalette.
     */
    exports.getColors = function(pal) {
        return colors[pal];
    }

    exports.getColorMatrix = function() {
        return colors;
    }

    /**
     * Gets or sets the bit depth of this Palette.
     */
    exports.getBitsPerPixel = function() {
        return bpp;
    }

    exports.setBitsPerPixel = function(value) {
        bpp = value;
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
    function ReadPalette(block, bpp, count) {
        if (bpp != 2 && bpp != 4)
            throw new Error(
                    "Palette error: Incorrect color depth specified.");

        if (count < 1)
            throw new Error(
                    "Palette error: Must specify positive number of subpalettes.");

        colors = new Array[count];
        for (var pal = 0; pal < count; pal++) {
            colors[pal] = new Array[Math.pow(2, bpp)];
            for (var i = 0; i < Math.pow(2, bpp); i++) {
                var clr16 = block.readDoubleShort();

                var b = (((clr16 >> 10) & 31) * 8);
                var g = (((clr16 >> 5) & 31) * 8);
                var r = ((clr16 & 31) * 8);
                colors[pal][i] = Color.rgb(r, g, b);
            }
        }
    }
}).call(Palette.prototype);

});