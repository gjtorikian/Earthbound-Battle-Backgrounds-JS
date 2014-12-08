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
   * 3 Palette cycle type
   *
   * 4 Palette cycle #1 start
   *
   * 5 Palette cycle #1 end
   *
   * 6 Palette cycle #2 start
   *
   * 7 Palette cycle #2 end
   *
   * 8 Palette cycle speed
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
   * Which kind of palette cycle to use.
   */
  this.paletteCycleType = function() {
    return this.bbgData[3];
  };

  /**
   * Cycle 1 Start Index
   */
  this.paletteCycle1Start = function() {
    return this.bbgData[4];
  };

  /**
   * Cycle 1 End Index
   */
  this.paletteCycle1End = function() {
    return this.bbgData[5];
  };

  /**
   * Cycle 2 Start Index
   */
  this.paletteCycle2Start = function() {
    return this.bbgData[6];
  };

  /**
   * Cycle 2 End Index
   */
  this.paletteCycle2End = function() {
    return this.bbgData[7];
  };

  /**
   * Determines the animation speed of the palette cycle in frames the animation is held. (ie. 3 = palette changes every 3 frames, 60 = palette changes every 60 frames)
   */
  this.paletteCycleSpeed = function() {
    return this.bbgData[8];
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
