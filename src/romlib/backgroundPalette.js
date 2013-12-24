define(function(require, exports, module) {

var LOG_TAG = "BackgroundPalette";

var RomObject = require("romlib/romObject");
var Rom = require("romlib/rom");

var BackgroundPalette = exports.BackgroundPalette = function BackgroundPalette() {
	this.colors = null;
    this.bpp = null;
    this.address = 0;

	return this;
};

(function(){
  exports.name = this.name = function() {
    return LOG_TAG;
  };

  BackgroundPalette.prototype.read = function(index) {
    var ptr = this.getParent().readBlock(0xADCD9 + index * 4);
    address = Rom.snesToHex(ptr.readInt());

    var data = this.getParent().readBlock(address);
    this.address = address;
    this.readPalette(data, this.bpp, 1);
  };

  BackgroundPalette.prototype.setParent = function(value) {
    this.parent = value;
  }

  BackgroundPalette.prototype.getParent = function(value) {
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
  BackgroundPalette.prototype.getColors = function(pal) {
    return this.colors[pal];
  }

  BackgroundPalette.prototype.getColorMatrix = function() {
    return this.colors;
  }

  /**
   * Gets or sets the bit depth of this Palette.
   */
  BackgroundPalette.prototype.getBitsPerPixel = function() {
    return this.bpp;
  }

  BackgroundPalette.prototype.setBitsPerPixel = function(value) {
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
  BackgroundPalette.prototype.readPalette = function(block, bpp, count) {
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
            var clr16 = block.readDoubleShort()[0];

            var b = (((clr16 >> 10) & 31) * 8);
            var g = (((clr16 >> 5) & 31) * 8);
            var r = ((clr16 & 31) * 8);

            // convert RGB to color int
            // this code is straight out of Android: http://git.io/F1lZtw
            this.colors[pal][i] = (0xFF << 24) | (r << 16) | (g << 8) | b;
        }
    }
  }
}).call(BackgroundPalette.prototype);

});
