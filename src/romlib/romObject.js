define(function(require, exports, module) {

var RomObject = exports.RomObject = function() {
  this.parent = null;
  this.id = "";

  this.address = -1;
  this.index = 1;

  return this;
};

(function(){
  /*
   * Properties
   */
  exports.getParent = function() {
    return parent;
  }

  exports.setParent = function(value) {
    parent = value;
  }

  exports.getID = function() {
    return id;
  }

  exports.setID = function(value) {
    id = value;
  }

  exports.getIndex = function() {
    return index;
  }

  exports.getAddress = function() {
    return address;
  }
}).call(RomObject.prototype);

});
