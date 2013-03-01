define(function(require, exports, module) {

var romObject = require("romlib/romObject");
var LOG_TAG = "BattleBG";

var battleBG = exports.battleBG = function() {

};

(function(){
    exports.name = function() { 
        return LOG_TAG;
    };
    
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
    this.bbgData = Int16Array[17];

    /**
     * Index of the compresses graphics/arrangement to use for this
     */
    this.getGraphicsIndex = function() {
        return this.this.bbgData[0];
    };

    /**
     * Index of the background palette to use.
     */
    this.getPaletteIndex = function() {
        return this.this.bbgData[1];
    };

    /**
     * Must always be 2 or 4. (TODO: change this property's type to an enum)
     */
    this.getBitsPerPixel = function() {
        return this.this.bbgData[2];
    };

    /**
     * Bytes 13-16 of BG data in big-endian order. Exact function unknown;
     * related to background animation effects.
     */
    this.getAnimation = function() {
        return (this.bbgData[13] << 24) + (this.bbgData[14] << 16) + (this.bbgData[15] << 8)
                + this.bbgData[16];
    };

    this.Read = function(index) {
        var main = getParent().ReadBlock(0xADEA1 + index * 17);

        for (var i = 0; i < 17; i++) {
            this.bbgData[i] = main.ReadShort();
        }
    };

    this.Write = function(index) {
        // We can just allocate a fixed block here:
        var main = getParent().AllocateFixedBlock(17, 0xADEA1 + index * 17);
        for (var i = 0; i < 17; i++)
            main.Write(this.bbgData[i]);
    };

    /**
     * The handler for loading/saving all battle BGs
     */
    exports.Handler = function() {
        this.ReadClass = function(rom) {
            // The only way to determine the bit depth of each BG palette is
            // to check the bit depth of the backgrounds that use it - so,
            // first we create an array to track palette bit depths:
            var palbits = new Int32Array[114];
            var gfxbits = new Int32Array[103];

            for (var i = 0; i < 327; i++) {
                var bg = new BattleBG();
                rom.Add(bg);
                bg.Read(i);

                // Now that the BG has been read, update the BPP entry for its
                // palette
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
                var p = new BackgroundPalette();
                rom.Add(p);
                p.setBitsPerPixel(palbits[i]);
                p.Read(i);
            }

            // Load graphics
            for (var i = 0; i < 103; i++) {
                var g = new BackgroundGraphics();
                rom.Add(g);
                g.setBitsPerPixel(gfxbits[i]);
                g.Read(i);
            }
        }
    }

}).call(battleBG.prototype);

});