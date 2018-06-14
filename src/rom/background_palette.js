import { readBlock, snesToHex } from './rom'
export default class BackgroundPalette {
  constructor (index, bitsPerPixel) {
    this.colors = null
    this.bitsPerPixel = bitsPerPixel
    this.read(index)
  }
  read (index) {
    const pointer = readBlock(0xDAD9 + index * 4)
    const address = snesToHex(pointer.readInt32())
    const data = readBlock(address)
    this.address = address
    this.readPalette(data, this.bitsPerPixel, 1)
  }
  /**
  * Gets an array of colors representing one of this palette's subpalettes.
  *
  * @param palette
  * The index of the subpalette to retrieve.
  *
  * @return An array containing the colors of the specified subpalette.
  */
  getColors (palette) {
    return this.colors[palette]
  }
  getColorMatrix () {
    return this.colors
  }
  /**
  * Internal function - reads palette data from the given block into this
  * palette's colors array.
  *
  * @param block
  * Block to read palette data from.
  * @param bitsPerPixel
  * Bit depth: Must be either 2 or 4.
  * @param count
  * Number of subpalettes to read.
  */
  readPalette (block, bitsPerPixel, count) {
    if (this.bitsPerPixel !== 2 && this.bitsPerPixel !== 4) {
      throw new Error('Palette error: Incorrect color depth specified.')
    }
    if (count < 1) {
      throw new Error('Palette error: Must specify positive number of subpalettes.')
    }
    this.colors = new Array(count)
    const power = 2 ** this.bitsPerPixel
    for (let palette = 0; palette < count; ++palette) {
      this.colors[palette] = new Array(power)
      for (let i = 0; i < power; i++) {
        const clr16 = block.readDoubleShort()
        const b = ((clr16 >> 10) & 31) * 8
        const g = ((clr16 >> 5) & 31) * 8
        const r = (clr16 & 31) * 8
        // convert RGB to color int
        // this code is straight out of Android: http://git.io/F1lZtw
        this.colors[palette][i] = (0xFF << 24) | (r << 16) | (g << 8) | b
      }
    }
  }
}
