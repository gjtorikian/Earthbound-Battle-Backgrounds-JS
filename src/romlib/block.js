define(function(require, exports, module) {

var Rom = require("romlib/rom");

/*
 Represents a chunk of the ROM's data requested by an object for reading or
 writing.

 A requested block should always correspond exactly to an area of strictly
 contiguous data within an object.
 */

 // Internal data:
// Reference to ROM
// Readable/Writable specifiers
// Location of data within ROM
// Size of data (if applicable)
// private Rom Rom;
// var blockData = new Int16Array(1);
// private byte[] buffer; // for write operations
var address;
var pointer;
var size;
var writable;

var blockOutput = new Int16Array(1);

var Block = exports.Block = function Block(data, location, writable) {
    this.blockData = data;
    this.size = -1;
    this.address = location;
    this.pointer = location;
    this.writable = writable;

    return this;
};

(function(){
  Block.prototype.getPointer = function() {
      return this.pointer;
  }

  Block.prototype.write = function(value) {
    if (this.pointer + 2 >= this.address + this.size)
        throw new Error("Block write overflow!");
    this.blockData[this.pointer++] = value;
    this.blockData[this.pointer++] = (value >> 8);
  }

  /**
   * Decompresses data from the block's current position. Note that this
   * method first measures the compressed data's size before allocating the
   * destination array, which incurs a slight additional overhead.
   *
   * @return An array containing the decompressed data.
   */

  Block.prototype.decomp = function() {
    var size = Rom.getCompressedSize(this.pointer, this.blockData);
    if (size < 1)
        throw new Error("Invalid compressed data: " + size);

    var blockOutput = new Int16Array(size);
    var read = 0;

    blockOutput = Rom.decomp(this.pointer, this.blockData, blockOutput, read);
    if (blockOutput == null)
        throw new Error(
            "ERROR! Computed and actual decompressed sizes do not match. Please reinstall universe and reboot.");

    return blockOutput;
  }

  /**
   * Reads a 16-bit integer from the block's current position and advances the
   * current position by 2 bytes.
   *
   * @return The 16-bit value at the current position.
   */

  Block.prototype.readShort = function() {
    return (this.blockData[this.pointer++]);
  }

  /**
   * Reads a 32-bit integer from the block's current position and advances the
   * current position by 4 bytes.
   */
  Block.prototype.readInt = function() {
    return (this.blockData[this.pointer++] + (this.blockData[this.pointer++] << 8) + (this.blockData[this.pointer++] << 16) + (this.blockData[this.pointer++] << 24));
  }

  Block.prototype.readDoubleShort = function() {
    var fakeShort = new Int16Array(1);
    fakeShort[0] = (this.blockData[this.pointer++] + (this.blockData[this.pointer++] << 8));
    return fakeShort;
  }
}).call(Block.prototype);

});
