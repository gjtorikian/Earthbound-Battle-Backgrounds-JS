define(function(require, exports, module) {

var RomObject = require("romlib/romObject");
var BackgroundPalette = require("romlib/backgroundPalette");
var BackgroundGraphics = require("romlib/backgroundGraphics");

var LOG_TAG = "BattleBG";

var BattleBG = exports.BattleBG = function() {
  /*
   * Background data table: $CADCA1
   *
   * 17 bytes per entry: ===================
   *
   * 0 Graphics/Arrangement index
   *
   * 1 Palette
   *
   * 2 Bits per pixel
   *
   * 3 Palette animation
   *
   * 4 Palette animation info
   *
   * 5 Palette animation info (UNKNOWN, number of palettes?)
   *
   * 6 UNKNOWN
   *
   * 7 Palette animation speed
   *
   * 8 Screen shift
   *
   * 9 Mov
   *
   * 10 Mov
   *
   * 11 Mov
   *
   * 12 Mov
   *
   * 13 Effects
   *
   * 14 Effects
   *
   * 15 Effects
   *
   * 16 Effects
   */
  this.bbgData = new Int16Array(17);
};

(function(){
  exports.name = this.name = function() {
    return LOG_TAG;
  };

  /**
   * Index of the compresses graphics/arrangement to use for this
   */
  this.getGraphicsIndex = function() {
    return this.bbgData[0];
  };

  /**
   * Index of the background Palette to use.
   */
  this.getPaletteIndex = function() {
    return this.bbgData[1];
  };

  /**
   * Must always be 2 or 4. (TODO: change this property's type to an enum)
   */
  this.getBitsPerPixel = function() {
    return this.bbgData[2];
  };

  /**
   * Bytes 13-16 of BG data in big-endian order. Exact function unknown;
   * related to background animation effects.
   */
  this.getAnimation = function() {
    return (this.bbgData[13] << 24) + (this.bbgData[14] << 16) + (this.bbgData[15] << 8)
            + this.bbgData[16];
  };

  this.read = function(index) {
    var main = this.getParent().readBlock(0xADEA1 + index * 17);

    for (var i = 0; i < 17; i++) {
        this.bbgData[i] = main.readShort();
    }
  };

  this.Write = function(index) {
    // We can just allocate a fixed block here:
    var main = this.getParent().AllocateFixedBlock(17, 0xADEA1 + index * 17);
    for (var i = 0; i < 17; i++)
        main.Write(this.bbgData[i]);
  };

  this.setParent = function(value) {
    this.parent = value;
  }

  this.getParent = function(value) {
    return this.parent;
  }

  /**
   * The handler for loading/saving all battle BGs
   */
  exports.Handler = function(Rom) {
    // The only way to determine the bit depth of each BG Palette is
    // to check the bit depth of the backgrounds that use it - so,
    // first we create an array to track Palette bit depths:
    var palbits = new Int32Array(114);
    var gfxbits = new Int32Array(103);

    for (var i = 0; i < 327; i++) {
        var bg = new BattleBG();
        Rom.add(bg);
        bg.read(i);
        // Now that the BG has been read, update the BPP entry for its
        // Palette
        // We can also check to make sure palettes are used
        // consistently:
        var pal = bg.getPaletteIndex();

        if (palbits[pal] != 0 && palbits[pal] != bg.getBitsPerPixel())
            throw new Exception(
                    "Battle BG Palette Error - inconsistent bit depth");
        palbits[pal] = bg.getBitsPerPixel();

        gfxbits[bg.getGraphicsIndex()] = bg.getBitsPerPixel();
    }

    // Now load palettes
    for (var i = 0; i < 114; i++) {
        var p = new BackgroundPalette.BackgroundPalette();
        p.setParent(Rom);
        p.setBitsPerPixel(palbits[i]);
        p.read(i);
        Rom.add(p);
    }

    // Load graphics
    for (var i = 0; i < 103; i++) {
        var g = new BackgroundGraphics.BackgroundGraphics();
        Rom.add(g);
        g.setBitsPerPixel(gfxbits[i]);
        g.read(i);
    }
  }

}).call(BattleBG.prototype);

});
