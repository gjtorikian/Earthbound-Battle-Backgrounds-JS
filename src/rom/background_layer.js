import BackgroundGraphics from './background_graphics'
import BackgroundPalette from './background_palette'
import DistortionEffect from './distortion_effect'
import BattleBackground from './battle_background'
import Distorter from './distorter'
import PaletteCycle from './palette_cycle'
const [WIDTH, HEIGHT] = [256, 256]
export default class BackgroundLayer {
  constructor (entry, rom) {
    this.rom = rom
    this.graphics = null
    this.paletteCycle = null
    this.pixels = new Int16Array(WIDTH * HEIGHT * 4)
    this.distorter = new Distorter(this.pixels)
    this.loadEntry(entry)
  }
  /**
  * Renders a frame of the background animation into the specified Bitmap
  *
  * @param dst
  *            Bitmap object into which to render
  * @param letterbox
  *            Size in pixels of black borders at top and bottom of image
  * @param ticks
  *            Time value of the frame to compute
  * @param alpha
  *            Blending opacity
  * @param erase
  *            Whether or not to clear the destination bitmap before
  *            rendering
  */
  overlayFrame (bitmap, letterbox, ticks, alpha, erase) {
    if (this.paletteCycle !== null) {
      this.paletteCycle.cycle()
      this.graphics.draw(this.pixels, this.paletteCycle)
    }
    return this.distorter.overlayFrame(bitmap, letterbox, ticks, alpha, erase)
  }
  loadGraphics (index) {
    this.graphics = this.rom.getObject(BackgroundGraphics, index)
  }
  loadPalette (background) {
    this.paletteCycle = new PaletteCycle({
      background,
      palette: this.rom.getObject(BackgroundPalette, background.paletteIndex)
    })
  }
  loadEffect (index) {
    this.distorter.effect = new DistortionEffect(index)
  }
  loadEntry (index) {
    this.entry = index
    const background = this.rom.getObject(BattleBackground, index)
    /* Set graphics/palette */
    this.loadGraphics(background.graphicsIndex)
    this.loadPalette(background)
    const animation = background.animation
    const e1 = (animation >> 24) & 0xFF
    const e2 = (animation >> 16) & 0xFF
    this.loadEffect(e2 || e1)
  }
}
