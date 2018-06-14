import { readBlock } from './rom'

/* In the ROM, each battle background struct at 0xADEA1 takes up 17 bytes. */
const STRUCT_SIZE = 17
export default class BattleBackground {
  /*
  * Background data table: $CADCA1
  * 17 bytes per entry:
  *
  * 0 Graphics/Arrangement index
  * 1 Palette
  * 2 Bits per pixel
  * 3 Palette cycle type
  * 4 Palette cycle #1 start
  * 5 Palette cycle #1 end
  * 6 Palette cycle #2 start
  * 7 Palette cycle #2 end
  * 8 Palette cycle speed
  * 9 Mov
  * 10 Mov
  * 11 Mov
  * 12 Mov
  * 13 Effects
  * 14 Effects
  * 15 Effects
  * 16 Effects
  */
  constructor (i = 0) {
    this.bbgData = new Int16Array(STRUCT_SIZE)
    this.read(i)
  }
  /**
  * Index of the compresses graphics/arrangement to use for this
  */
  get graphicsIndex () {
    return this.bbgData[0]
  }
  /**
  * Index of the background Palette to use.
  */
  get paletteIndex () {
    return this.bbgData[1]
  }
  /**
  * Must always be 2 or 4.
  */
  get bitsPerPixel () {
    return this.bbgData[2]
  }
  /**
  * Which kind of palette cycle to use.
  */
  get paletteCycleType () {
    return this.bbgData[3]
  }
  /**
  * Cycle 1 Start Index
  */
  get paletteCycle1Start () {
    return this.bbgData[4]
  }
  /**
  * Cycle 1 End Index
  */
  get paletteCycle1End () {
    return this.bbgData[5]
  }
  /**
  * Cycle 2 Start Index
  */
  get paletteCycle2Start () {
    return this.bbgData[6]
  }
  /**
  * Cycle 2 End Index
  */
  get paletteCycle2End () {
    return this.bbgData[7]
  }
  /**
  * Determines the animation speed of the palette cycle in frames the animation is held. (ie. 3 = palette changes every 3 frames, 60 = palette changes every 60 frames)
  */
  get paletteCycleSpeed () {
    return this.bbgData[8]
  }
  /* TODO: Implement these! */
  get horizontalMovement () {
    return this.bbgData[9]
  }
  get verticalMovement () {
    return this.bbgData[10]
  }
  get horizontalAcceleration () {
    return this.bbgData[11]
  }
  get verticalAcceleration () {
    return this.bbgData[12]
  }
  /**
  * Bytes 13-16 of BG data in big-endian order. Exact function unknown;
  * related to background animation effects.
  */
  get animation () {
    return (this.bbgData[13] << 24) + (this.bbgData[14] << 16) + (this.bbgData[15] << 8) + this.bbgData[16]
  }
  read (index) {
    const main = readBlock(0xDCA1 + index * STRUCT_SIZE)
    for (let i = 0; i < STRUCT_SIZE; ++i) {
      this.bbgData[i] = main.readInt16()
    }
  }
}
