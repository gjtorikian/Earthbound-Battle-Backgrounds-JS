import BackgroundGraphics from "./background_graphics";
import BackgroundPalette from "./background_palette";
import DistortionEffect from "./distortion_effect";
import BattleBackground from "./battle_background";
import Distorter from "./distorter";
import PaletteCycle from "./palette_cycle";
const [WIDTH, HEIGHT] = [256, 256];
export default class BackgroundLayer {
  constructor(entry, rom) {
    this.rom = rom;
    this.graphics = null;
    this.paletteCycle = null;
    this.pixels = new Int16Array(WIDTH * HEIGHT * 4);
    this.distorter = new Distorter(this.pixels);
    this.loadEntry(entry);
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
  overlayFrame(bitmap, letterbox, ticks, alpha, erase) {
    if (this.paletteCycle !== null) {
      this.paletteCycle.cycle();
      this.graphics.draw(this.pixels, this.paletteCycle);
    }
    return this.distorter.overlayFrame(bitmap, letterbox, ticks, alpha, erase);
  }
  loadGraphics(index) {
    this.graphics = this.rom.getObject(BackgroundGraphics, index);
  }
  loadPalette(background) {
    this.paletteCycle = new PaletteCycle({
      background,
      palette: this.rom.getObject(BackgroundPalette, background.paletteIndex),
    });
  }
  loadEffects(indices) {
    /* A null (zero) first slot passes control to the second slot; a null slot anywhere after that truncates the sequence (e.g. entry 227's slots are [120, 121, 0, 114], and only the first two are ever played) */
    let slots = indices[0] === 0 ? indices.slice(1) : indices;
    const firstNull = slots.indexOf(0);
    if (firstNull !== -1) {
      slots = slots.slice(0, firstNull);
    }
    if (slots.length === 0) {
      slots = [0];
    }
    this.distorter.effects = slots.map((index) => new DistortionEffect(index));
  }
  loadEntry(index) {
    this.entry = index;
    const background = this.rom.getObject(BattleBackground, index);
    /* Set graphics/palette */
    this.loadGraphics(background.graphicsIndex);
    this.loadPalette(background);
    const animation = background.animation;
    this.loadEffects([
      (animation >> 24) & 0xff,
      (animation >> 16) & 0xff,
      (animation >> 8) & 0xff,
      animation & 0xff,
    ]);
  }
}
