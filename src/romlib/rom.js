define(function(require, exports, module) {

var LOG_TAG = "Rom";

var RomClasses = require("romlib/romClasses");
var Block = require("romlib/block");
var Utils = require("romlib/utils");

var Rom = exports.Rom = function Rom() {
  this.objects = {}, self = this;
  this.loaded = false;
  this.romData = [];

  // New step: every ROM needs to have its own instance of
  // each type handler.
  this.handlers = {};
  var typeValues = RomClasses.getTypes();
  Utils.each(Utils.values(RomClasses.getTypes()), function(e) {
      if (e.Handler != null) {
          self.handlers[e.Type.name()] = e.Handler;
      }
  });

  return this;
};

(function(){

  exports.getIsLoaded = function() {
    return this.loaded;
  }

  exports.registerType = function(typeID, type, handler) {
    RomClasses.registerClass(typeID, type, handler);
  }

  exports.open = function(stream)  {
    this.romData = stream;

    this.loaded = true;
    var self = this;

    Utils.each(this.handlers, function(handler, key) {
        console.log(LOG_TAG + ": Reading " + key);
        handler(self);
        console.log(LOG_TAG + ": Read " + key);
    });
  }

  /**
   * Adds an object to the ROM container.
   *
   * @param o
   *            The RomObject to add
   */

  exports.add = function(o) {
    var type = o.name();

    // Create a new type list (if necessary)
    if (this.objects[type] === undefined)
        this.objects[type] = [];

    o.setParent(this);

    this.objects[type].push(o);
  }

  exports.setObjectByType = function(type, index, object) {
    this.objects[type][index] = object;
  }

  exports.getObjectByType = function(type, index) {
    try {
        return this.objects[type][index];
    } catch (e) {
        console.log("Unexpected error getting by type")
        return null;
    }
  }

  exports.getObjectByTypename = function(typename, index) {
    var type = Utils.findWhere(RomClasses.getTypes(), {ID: typename});
    var obj = this.objects[type.ID];

    try {
        return obj[index];
    } catch (e) {
        console.log("Unexpected error getting by typename")
        return null;
    }
  }

  /**
   * Returns a collection of all RomObjects of a given type contained within
   * this ROM.
   *
   * @param type
   *            The type of RomObjects to retrieve
   * @param typeID
   *            The string identifying the type of RomObjects to retrieve
   *
   * @return A List of RomObjects
   */

  exports.getObjectsByType = function(type) {
    return this.objects[type];
  }

  exports.getObjectHandler = function(type) {
    return handlers[type];
  }

  /**
   * Returns a readable block at the given location. Nominally, should also
   * handle tracking free space depending on the type of read requested.
   * (i.e., an object may be interested in read-only access anywhere, but if
   * an object is reading its own data, it should specify this so the Rom can
   * mark the read data as "free")
   *
   * @param location
   *            The address from which to read
   *
   * @return A readable block
   */

  exports.readBlock = function(location) {
    // NOTE: there's no address conversion implemented yet;
    // we're assuming all addresses are file offsets (with header)

    // For now, just return a readable block; we'll worry about
    // typing and free space later
    return new Block.Block(this.romData, location, false);
  }

  /**
   * Allocates a writeable block using the Unrestricted storage model. The
   * resulting block may be located anywhere in the ROM.
   *
   *
   * @param size
   *            The size, in bytes, required for this block
   * @return A writeable block, or null if allocation failed
   */
  exports.allocateBlock = function(size) {
    return null;
  }

  /**
   * Allocates a writeable block using the Fixed storage model. The resulting
   * block is always located at the given address.
   *
   * @param size
   *            The size, in bytes, required for this block
   * @param location
   *            The starting address of the desired block
   * @return A writeable block of size bytes in the specified location, or
   *         null if allocation failed
   */
  exports.allocateFixedBlock = function(size, location) {
    return null;
  }

  /**
   * Allocates a writeable block using the Local storage model. Reserves a
   * block of space within a previously allocated local segment.
   *
   * @param size
   *            The size, in bytes, required for this block
   * @param ticket
   *            A local segment identifier previously obtained from
   *            AllocateLocalSegment, identifying a pre-allocated space that
   *            has been reserved for a particular set of local-access objects
   * @return A writeable block of size bytes in the given local segment.
   */
  exports.allocateLocalBlock = function(size, ticket) {
    return null;
  }

  exports.$hexToSnes = function(address, header) {
    if (header)
        address -= 0x200;

    if (address >= 0 && address < 0x400000)
        return address + 0xC00000;
    else if (address >= 0x400000 && address < 0x600000)
        return address;
    else
        throw new Error("File offset out of range: " + address);
  }

  exports.hexToSnes = function(address) {
    return this.$hexToSnes(address, true);
  }

  exports.$snesToHex = function(address, header) {
    if (address >= 0x400000 && address < 0x600000)
        address -= 0x0;
    else if (address >= 0xC00000 && address < 0x1000000)
        address -= 0xC00000;
    else
        throw new Error("SNES address out of range: " + address);

    if (header)
        address += 0x200;

    return address;
  }

  exports.snesToHex = function(address) {
    return this.$snesToHex(address, true);
  }

  // This is an internal optimization for the comp/decomp methods.
  // Every element in this array is the binary reverse of its index.
  exports.bitrevs = new Int16Array ([ 0, 128, 64, 192, 32, 160, 96,
          224, 16, 144, 80, 208, 48, 176, 112, 240, 8, 136, 72, 200, 40, 168,
          104, 232, 24, 152, 88, 216, 56, 184, 120, 248, 4, 132, 68, 196, 36,
          164, 100, 228, 20, 148, 84, 212, 52, 180, 116, 244, 12, 140, 76,
          204, 44, 172, 108, 236, 28, 156, 92, 220, 60, 188, 124, 252, 2,
          130, 66, 194, 34, 162, 98, 226, 18, 146, 82, 210, 50, 178, 114,
          242, 10, 138, 74, 202, 42, 170, 106, 234, 26, 154, 90, 218, 58,
          186, 122, 250, 6, 134, 70, 198, 38, 166, 102, 230, 22, 150, 86,
          214, 54, 182, 118, 246, 14, 142, 78, 206, 46, 174, 110, 238, 30,
          158, 94, 222, 62, 190, 126, 254, 1, 129, 65, 193, 33, 161, 97, 225,
          17, 145, 81, 209, 49, 177, 113, 241, 9, 137, 73, 201, 41, 169, 105,
          233, 25, 153, 89, 217, 57, 185, 121, 249, 5, 133, 69, 197, 37, 165,
          101, 229, 21, 149, 85, 213, 53, 181, 117, 245, 13, 141, 77, 205,
          45, 173, 109, 237, 29, 157, 93, 221, 61, 189, 125, 253, 3, 131, 67,
          195, 35, 163, 99, 227, 19, 147, 83, 211, 51, 179, 115, 243, 11,
          139, 75, 203, 43, 171, 107, 235, 27, 155, 91, 219, 59, 187, 123,
          251, 7, 135, 71, 199, 39, 167, 103, 231, 23, 151, 87, 215, 55, 183,
          119, 247, 15, 143, 79, 207, 47, 175, 111, 239, 31, 159, 95, 223,
          63, 191, 127, 255 ]);

  // Do not try to understand what this is doing. It will hurt you.
  // The only documentation for this decompression routine is a 65816
  // disassembly.

  // This function can return the following error codes:
  //
  // ERROR MEANING
  // -1 Something went wrong
  // -2 I dunno
  // -3 No idea
  // -4 Something went _very_ wrong
  // -5 Bad stuff
  // -6 Out of ninjas error
  // -7 Ask somebody else
  // -8 Unexpected end of data
  // public static

  /**
   * @param start
   * @param data
   * @param output
   *            Must already be allocated with at least enough space
   * @param read
   *            "Out" parameter which receives the number of bytes of
   *            compressed data read
   * @return The size of the decompressed data if successful, null otherwise
   */
  exports.decomp = function(start, data, output, read) {
    var maxlen = output.length;
    var pos = start;
    var bpos = 0, bpos2 = 0;
    var tmp;

    while ((data[pos]) != 0xFF) {
        // Data overflow before end of compressed data
        if (pos >= data.length) {
            read = pos - start + 1;
            return null;
            // return -8;
        }

        var cmdtype = (data[pos]) >> 5;
        var len = ((data[pos]) & 0x1F) + 1;

        if (cmdtype == 7) {
            cmdtype = ((data[pos]) & 0x1C) >> 2;
            len = (((data[pos]) & 3) << 8) + (data[pos + 1]) + 1;
            pos++;
        }

        // Error: block length would overflow maxlen, or block endpos
        // negative?
        if (bpos + len > maxlen || bpos + len < 0) {
            read = pos - start + 1;
            return null;
            // return -1;
        }

        pos++;

        if (cmdtype >= 4) {
            bpos2 = ((data[pos]) << 8) + (data[pos + 1]);
            if (bpos2 >= maxlen || bpos2 < 0) {
                read = pos - start + 1;
                return null;
                // return -2;
            }
            pos += 2;
        }

        switch (cmdtype) {
        case 0: // Uncompressed block
            while (len-- != 0)
                output[bpos++] = data[pos++];
            // Array.Copy(data, pos, output, bpos, len);
            // bpos += len;
            // pos += len;
            break;

        case 1: // RLE
            while (len-- != 0)
                output[bpos++] = data[pos];
            pos++;
            break;

        case 2: // 2-byte RLE
            if (bpos + 2 * len > maxlen || bpos < 0) {
                read = pos - start + 1;
                return null;
                // return -3;
            }
            while (len-- != 0) {
                output[bpos++] = data[pos];
                output[bpos++] = data[pos + 1];
            }
            pos += 2;
            break;

        case 3: // Incremental sequence
            tmp = data[pos++];
            while (len-- != 0)
                output[bpos++] = tmp++;
            break;

        case 4: // Repeat previous data
            if (bpos2 + len > maxlen || bpos2 < 0) {
                read = pos - start + 1;
                return null;
                // return -4;
            }
            for (var i = 0; i < len; i++) {
                output[bpos++] = output[bpos2 + i];
            }
            break;

        case 5: // Output with bits reversed
            if (bpos2 + len > maxlen || bpos2 < 0) {
                read = pos - start + 1;
                return null;
                // return -5;
            }
            while (len-- != 0) {
                output[bpos++] = this.bitrevs[output[bpos2++] & 0xFF];
            }
            break;

        case 6:
            if (bpos2 - len + 1 < 0) {
                read = pos - start + 1;
                return null;
                // return -6;
            }
            while (len-- != 0)
                output[bpos++] = output[bpos2--];
            break;

        case 7:
            read = pos - start + 1;
            return null;
            // return -7;
        }
    }

    read = pos - start + 1;
    return output;
  }

  exports.getCompressedSize = function(start, data) {
    var pos = start;
    var bpos = 0, bpos2 = 0;

    while ((data[pos]) != 0xFF) {
        // Data overflow before end of compressed data
        if (pos >= data.length)
            return -8;

        var cmdtype = (data[pos]) >> 5;
        var len = ((data[pos]) & 0x1F) + 1;

        if (cmdtype == 7) {
            cmdtype = ((data[pos]) & 0x1C) >> 2;
            len = (((data[pos]) & 3) << 8) + (data[pos + 1]) + 1;
            pos++;
        }

        if (bpos + len < 0)
            return -1;
        pos++;

        if (cmdtype >= 4) {
            bpos2 = ((data[pos]) << 8) + (data[pos + 1]);
            if (bpos2 < 0)
                return -2;
            pos += 2;
        }
        switch (cmdtype) {
        case 0: // Uncompressed block
            bpos += len;
            pos += len;
            break;

        case 1: // RLE
            bpos += len;
            pos += 1;
            break;

        case 2: // 2-byte RLE
            if (bpos < 0)
                return -3;
            bpos += 2 * len;
            pos += 2;
            break;

        case 3: // Incremental sequence
            bpos += len;
            pos += 1;
            break;

        case 4: // Repeat previous data
            if (bpos2 < 0)
                return -4;
            bpos += len;
            break;

        case 5: // Output with bits reversed
            if (bpos2 < 0)
                return -5;
            bpos += len;
            break;

        case 6:
            if (bpos2 - len + 1 < 0)
                return -6;
            bpos += len;
            break;

        case 7:
            return -7;
        }
    }
    return bpos;
  }
}).call(Rom.prototype);

});
