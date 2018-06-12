import padStart from 'string.prototype.padstart'
import BattleBackground from './battle_background'
import BackgroundGraphics from './background_graphics'
import BackgroundPalette from './background_palette'
import Block from './block'

const MINIMUM_INDEX = 0
const MAXIMUM_INDEX = 326

const UNCOMPRESSED_BLOCK = 0
const RUN_LENGTH_ENCODED_BYTE = 1
const RUN_LENGTH_ENCODED_SHORT = 2
const INCREMENTAL_SEQUENCE = 3
const REPEAT_PREVIOUS_DATA = 4
const REVERSE_BITS = 5
const UNKNOWN_1 = 6
const UNKNOWN_2 = 7
function generateReversedBytes () {
  const reversedBytes = new Int16Array(256)
  for (let i = 0; i < reversedBytes.length; ++i) {
    const binary = padStart(i.toString(2), 8, 0)
    const reversed = [...binary].reverse().join('')
    const value = Number.parseInt(reversed, 2)
    reversedBytes[i] = value
  }
  return reversedBytes
}
const REVERSED_BYTES = generateReversedBytes()
export function snesToHex (address, header = true) {
  let newAddress = address
  if (newAddress >= 0x400000 && newAddress < 0x600000) {
    newAddress -= 0x0
  } else if (newAddress >= 0xC00000 && newAddress < 0x1000000) {
    newAddress -= 0xC00000
  } else {
    throw new Error(`SNES address out of range: ${newAddress}`)
  }
  if (header) {
    newAddress += 0x200
  }
  return newAddress - 0xA0200
}
export function hexToSnes (address, header = true) {
  let newAddress = address
  if (header) {
    newAddress -= 0x200
  }
  if (newAddress >= 0 && newAddress < 0x400000) {
    return newAddress + 0xC00000
  } else if (newAddress >= 0x400000 && newAddress < 0x600000) {
    return newAddress
  } else {
    throw new Error(`File offset out of range: ${newAddress}`)
  }
}
/**
* Adds an object to the ROM container.
*
* @param o
* The ROMObject to add
*/
function add (objects, o) {
  const constructor = o.constructor
  if (!objects.has(constructor)) {
    objects.set(constructor, [])
  }
  objects.get(constructor).push(o)
}
/**
* Allocates a writeable block using the Unrestricted storage model. The
* resulting block may be located anywhere in the ROM.
*
*
* @param size
* The size, in bytes, required for this block
* @return A writeable block, or null if allocation failed
*/
/**
* Returns a readable block at the given location. Nominally, should also
* handle tracking free space depending on the type of read requested.
* (i. e., an object may be interested in read-only access anywhere, but if
* an object is reading its own data, it should specify this so the ROM can
* mark the read data as "free")
*
* @param location
* The address from which to read
*
* @return A readable block
*/
export function readBlock (location) {
  // NOTE: there's no address conversion implemented yet;
  // we're assuming all addresses are file offsets (with header)
  // For now, just return a readable block; we'll worry about
  // typing and free space later
  return new Block(location)
}
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
/**
* @param start
* @param data
* @param output
* Must already be allocated with at least enough space
* @param read
* "Out" parameter which receives the number of bytes of
* compressed data read
* @return The size of the decompressed data if successful, null otherwise
*/
export function decompress (start, data, output, read) {
  const maxLength = output.length
  let pos = start
  let bpos = 0
  let bpos2 = 0
  let tmp
  let newRead = read // eslint-disable-line
  while (data[pos] !== 0xFF) {
    // Data overflow before end of compressed data
    if (pos >= data.length) {
      newRead = pos - start + 1
      return null
    }
    let commandType = data[pos] >> 5
    let len = (data[pos] & 0x1F) + 1
    if (commandType === 7) {
      commandType = (data[pos] & 0x1C) >> 2
      len = ((data[pos] & 3) << 8) + data[pos + 1] + 1
      ++pos
    }
    // Error: block length would overflow maxLength, or block endpos
    // negative?
    if (bpos + len > maxLength || bpos + len < 0) {
      newRead = pos - start + 1
      return null
    }
    ++pos
    if (commandType >= 4) {
      bpos2 = (data[pos] << 8) + data[pos + 1]
      if (bpos2 >= maxLength || bpos2 < 0) {
        newRead = pos - start + 1
        return null
      }
      pos += 2
    }
    switch (commandType) {
      case UNCOMPRESSED_BLOCK:
        while (len-- !== 0) {
          output[bpos++] = data[pos++]
        }
        break
      case RUN_LENGTH_ENCODED_BYTE:
        while (len-- !== 0) {
          output[bpos++] = data[pos]
        }
        ++pos
        break
      case RUN_LENGTH_ENCODED_SHORT:
        if (bpos + 2 * len > maxLength || bpos < 0) {
          newRead = pos - start + 1
          return null
        }
        while (len-- !== 0) {
          output[bpos++] = data[pos]
          output[bpos++] = data[pos + 1]
        }
        pos += 2
        break
      case INCREMENTAL_SEQUENCE:
        tmp = data[pos++]
        while (len-- !== 0) {
          output[bpos++] = tmp++
        }
        break
      case REPEAT_PREVIOUS_DATA:
        if (bpos2 + len > maxLength || bpos2 < 0) {
          newRead = pos - start + 1
          return null
        }
        for (let i = 0; i < len; ++i) {
          output[bpos++] = output[bpos2 + i]
        }
        break
      case REVERSE_BITS:
        if (bpos2 + len > maxLength || bpos2 < 0) {
          newRead = pos - start + 1
          return null
        }
        while (len-- !== 0) {
          output[bpos++] = REVERSED_BYTES[output[bpos2++] & 0xFF]
        }
        break
      case UNKNOWN_1:
        if (bpos2 - len + 1 < 0) {
          newRead = pos - start + 1
          return null
        }
        while (len-- !== 0) {
          output[bpos++] = output[bpos2--]
        }
        break
      default:
      case UNKNOWN_2:
        newRead = pos - start + 1
        return null
    }
  }
  newRead = pos - start + 1
  return output
}
export function getCompressedSize (start, data) {
  /* I use `var` as a workaround, because babili's transform currently binds it to the wrong scope! */
  var bpos = 0
  let pos = start
  let bpos2 = 0
  while (data[pos] !== 0xFF) {
    /* Data overflow before end of compressed data */
    if (pos >= data.length) {
      return -8
    }
    let commandType = data[pos] >> 5
    let length = (data[pos] & 0x1F) + 1
    if (commandType === 7) {
      commandType = (data[pos] & 0x1C) >> 2
      length = ((data[pos] & 3) << 8) + (data[pos + 1]) + 1
      ++pos
    }
    if (bpos + length < 0) {
      return -1
    }
    pos++
    if (commandType >= 4) {
      bpos2 = (data[pos] << 8) + (data[pos + 1])
      if (bpos2 < 0) {
        return -2
      }
      pos += 2
    }
    switch (commandType) {
      case UNCOMPRESSED_BLOCK:
        bpos += length
        pos += length
        break
      case RUN_LENGTH_ENCODED_BYTE:
        bpos += length
        ++pos
        break
      case RUN_LENGTH_ENCODED_SHORT:
        if (bpos < 0) {
          return -3
        }
        bpos += 2 * length
        pos += 2
        break
      case INCREMENTAL_SEQUENCE:
        bpos += length
        ++pos
        break
      case REPEAT_PREVIOUS_DATA:
        if (bpos2 < 0) {
          return -4
        }
        bpos += length
        break
      case REVERSE_BITS:
        if (bpos2 < 0) {
          return -5
        }
        bpos += length
        break
      case UNKNOWN_1:
        if (bpos2 - length + 1 < 0) {
          return -6
        }
        bpos += length
        break
      default:
      case UNKNOWN_2:
        return -7
    }
  }
  return bpos
}
export let data
export default class ROM {
  constructor (stream) {
    data = stream
    this.objects = new Map()

    /* The only way to determine the bit depth of each BG Palette is to check the bit depth of the backgrounds that use it - so, first we create an array to track Palette bit depths: */
    const paletteBits = new Int32Array(114)
    const graphicsBits = new Int32Array(103)
    for (let i = MINIMUM_INDEX; i <= MAXIMUM_INDEX; ++i) {
      const background = new BattleBackground(i)
      add(this.objects, background)
      /* Now that the background has been read, update the BPP entry for its palette. We can also check to make sure palettes are used consistently: */
      const palette = background.paletteIndex
      const bitsPerPixel = background.bitsPerPixel
      if (paletteBits[palette] && paletteBits[palette] !== bitsPerPixel) {
        throw new Error('BattleBackground palette Error: Inconsistent bit depth')
      }
      paletteBits[palette] = bitsPerPixel
      graphicsBits[background.graphicsIndex] = bitsPerPixel
    }
    /* Now load palettes */
    for (let i = 0; i < 114; ++i) {
      add(this.objects, new BackgroundPalette(i, paletteBits[i]))
    }
    /* Load graphics */
    for (let i = 0; i < 103; ++i) {
      add(this.objects, new BackgroundGraphics(i, graphicsBits[i]))
    }
  }

  getObject (constructor, i) {
    return this.objects.get(constructor)[i]
  }
}
