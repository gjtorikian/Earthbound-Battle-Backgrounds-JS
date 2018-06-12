import { getCompressedSize, decompress, data } from './rom'
/* Represents a chunk of the ROM's data requested by an object for reading or writing. A requested block should always correspond exactly to an area of strictly contiguous data within an object. */
export default class Block {
  constructor (location) {
    this.address = location
    this.pointer = location
  }
  /**
  * Decompresses data from the block's current position. Note that this
  * method first measures the compressed data's size before allocating the
  * destination array, which incurs a slight additional overhead.
  *
  * @return An array containing the decompressed data.
  */
  decompress () {
    const size = getCompressedSize(this.pointer, data)
    if (size < 1) {
      throw new Error(`Invalid compressed data: ${size}`)
    }
    let blockOutput = new Int16Array(size)
    const read = 0
    blockOutput = decompress(this.pointer, data, blockOutput, read)
    if (blockOutput === null) {
      throw new Error('Computed and actual decompressed sizes do not match.')
    }
    return blockOutput
  }
  /**
  * Reads a 16-bit integer from the block's current position and advances the
  * current position by 2 bytes.
  *
  * @return The 16-bit value at the current position.
  */
  readInt16 () {
    return data[this.pointer++]
  }
  /* Reads a 32-bit integer from the block's current position and advances the current position by 4 bytes. */
  readInt32 () {
    return this.readInt16() + (this.readInt16() << 8) + (this.readInt16() << 16) + (this.readInt16() << 24)
  }
  readDoubleShort () {
    const fakeShort = new Int16Array([this.readInt16() + (this.readInt16() << 8)])
    return fakeShort[0]
  }
}
