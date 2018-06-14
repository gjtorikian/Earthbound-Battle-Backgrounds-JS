export default class ROMGraphics {
  constructor (bitsPerPixel) {
    this.bitsPerPixel = bitsPerPixel
  }
  /* Internal function - builds the tile array from the graphics buffer. */
  buildTiles () {
    const n = this.gfxROMGraphics.length / (8 * this.bitsPerPixel)
    this.tiles = []
    for (let i = 0; i < n; ++i) {
      this.tiles.push(new Array(8))
      const o = i * 8 * this.bitsPerPixel
      for (let x = 0; x < 8; ++x) {
        this.tiles[i][x] = new Array(8)
        for (let y = 0; y < 8; ++y) {
          let c = 0
          for (let bp = 0; bp < this.bitsPerPixel; ++bp) {
            // NOTE: Such a slight bug! We must Math.floor this value, due to the possibility of a number like 0.5 (which should equal 0).
            const halfBp = Math.floor(bp / 2)
            const gfx = this.gfxROMGraphics[o + y * 2 + (halfBp * 16 + (bp & 1))]
            c += ((gfx & (1 << 7 - x)) >> 7 - x) << bp
          }
          this.tiles[i][x][y] = c
        }
      }
    }
  }
  /* JNI C code */
  draw (bmp, palette, arrayROMGraphics) {
    const data = bmp
    let block = 0
    let tile = 0
    let subPalette = 0
    let n = 0
    let b1 = 0
    let b2 = 0
    let verticalFlip = false
    let horizontalFlip = false
    /* TODO: Hardcoding is bad; how do I get the stride normally? */
    const stride = 1024
    /* For each pixel in the 256×256 grid, we need to render the image found in the dump */
    for (let i = 0; i < 32; ++i) {
      for (let j = 0; j < 32; ++j) {
        n = j * 32 + i
        b1 = arrayROMGraphics[n * 2]
        b2 = arrayROMGraphics[n * 2 + 1] << 8
        block = b1 + b2
        tile = block & 0x3FF
        verticalFlip = (block & 0x8000) !== 0
        horizontalFlip = (block & 0x4000) !== 0
        subPalette = (block >> 10) & 7
        this.drawTile(data, stride, i * 8, j * 8, palette, tile, subPalette, verticalFlip, horizontalFlip)
      }
    }
    return data
  }
  drawTile (pixels, stride, x, y, palette, tile, subPalette, verticalFlip, horizontalFlip) {
    const subPaletteArray = palette.getColors(subPalette)
    let i, j, px, py, pos, rgbArray
    for (i = 0; i < 8; ++i) {
      if (horizontalFlip) {
        px = x + 7 - i
      } else {
        px = x + i
      }
      for (j = 0; j < 8; ++j) {
        rgbArray = subPaletteArray[this.tiles[tile][i][j]]
        if (verticalFlip) {
          py = y + 7 - j
        } else {
          py = y + j
        }
        pos = 4 * px + stride * py
        pixels[pos + 0] = (rgbArray >> 16) & 0xFF
        pixels[pos + 1] = (rgbArray >> 8) & 0xFF
        pixels[pos + 2] = (rgbArray) & 0xFF
      }
    }
    return pixels
  }
  /**
  * Internal function - reads graphics from the specified block and builds
  * tileset.
  *
  * @param block
  * The block to read graphics data from
  */
  loadGraphics (block) {
    this.gfxROMGraphics = block.decompress()
    this.buildTiles()
  }
}
