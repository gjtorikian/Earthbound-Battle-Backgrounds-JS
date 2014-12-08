define(function(require, exports, module) {

var Utils = require("romlib/utils");

var PaletteCycle = exports.PaletteCycle = function PaletteCycle(pal,type,start1,end1,start2,end2,speed) {
  this.pal = pal;
  this.type = type;
  this.start1 = start1;
  this.end1 = end1;
  this.start2 = start2;
  this.end2 = end2;
  this.speed = speed/2;

  this.cycleCountdown = this.speed;
  this.cycleCount = 0;

  this.original_colors = this.pal.getColorMatrix();
  this.now_colors = []
  // if (!window.showdebug) {
  //   this.debug = true
  //   window.showdebug = true
  // }

  // duplicate the original colors to make cycle math easier
  for (var subpalnum = 0; subpalnum < this.original_colors.length; subpalnum++) {
    this.now_colors[subpalnum] = [];
    for (var i = 16; i < 32; i++) {
      this.original_colors[subpalnum][i] = this.original_colors[subpalnum][i-16];
      this.now_colors[subpalnum][i-16] = this.original_colors[subpalnum][i];
    };
  }

  return this;
};

(function(){
  PaletteCycle.prototype.getEffect = function() {
    return this.type;
  }

  PaletteCycle.prototype.getColors = function(subpal) {
    return this.now_colors[subpal];
  }

  PaletteCycle.prototype.cycle = function() {
    if (this.speed == 0)
      return false
    this.cycleCountdown -= 1;
    if (this.cycleCountdown <= 0) {
      //console.log(this.cycleCountdown)
      this.cycleColors();
      this.cycleCount += 1;
      this.cycleCountdown = this.speed;
      return true;
    }
    return false;
  }

  PaletteCycle.prototype.cycleColors = function() {
    if (this.type == 1 || this.type == 2) {
      var cycleLength = this.end1 - this.start1 + 1
      var cycle1Position = this.cycleCount % (cycleLength)
      //console.log(cycle1Position)

      for (var subpalnum = 0; subpalnum < this.original_colors.length; subpalnum++) {
        for (var i = this.start1; i <= this.end1; i++) {
          var newcolor = i - cycle1Position;
          if (newcolor < this.start1)
            newcolor += cycleLength;
          this.now_colors[subpalnum][i] = this.original_colors[subpalnum][newcolor];

        };
      };
      //console.log(this.now_colors)
    }

    if (this.type == 2) {
      var cycleLength = this.end2 - this.start2 + 1
      var cycle2Position = this.cycleCount % cycleLength
      //console.log(cycle1Position)

      for (var subpalnum = 0; subpalnum < this.original_colors.length; subpalnum++) {
        for (var i = this.start2; i <= this.end2; i++) {
          var newcolor = i - cycle2Position;
          if (newcolor < this.start2)
            newcolor += cycleLength;
          this.now_colors[subpalnum][i] = this.original_colors[subpalnum][newcolor];

        };
      };
    }

    if (this.type == 3) {
      var cycleLength = this.end1 - this.start1 + 1
      var cycle1Position = this.cycleCount % (cycleLength*2)
      //console.log(cycle1Position)

      for (var subpalnum = 0; subpalnum < this.original_colors.length; subpalnum++) {
        for (var i = this.start1; i <= this.end1; i++) {
          var newcolor = i + cycle1Position;
          var difference = 0


          if (newcolor > this.end1) {
            difference = newcolor-this.end1-1;
            newcolor = this.end1 - difference;

            if (newcolor < this.start1) {
              difference = this.start1 - newcolor - 1;
              newcolor = this.start1 + difference
            }
          }

          // if (i == 14 && this.debug) {
          //   console.log("difference: "+difference+"newcolor: "+newcolor+" cycle1Position: "+cycle1Position+ "cycleLength: " + cycleLength + "cycleCount: "+this.cycleCount)
          // }
          this.now_colors[subpalnum][i] = this.original_colors[subpalnum][newcolor];

        };
      };
      //console.log(this.now_colors)
    }
  }

}).call(PaletteCycle.prototype);

});
