let frameID = -1
export const SNES_WIDTH = 256
export const SNES_HEIGHT = 224

/**
* Renders one frame of `layers` into `dst` at the given tick.
* Layer 0 erases (clears the buffer to its own contribution); subsequent
* layers blend on top. Returns the final bitmap.
*/
export function renderLayers (layers, dst, letterbox, tick, alpha) {
  let bitmap
  for (let i = 0; i < layers.length; ++i) {
    bitmap = layers[i].overlayFrame(dst, letterbox, tick, alpha[i], i === 0)
  }
  return bitmap
}

export default class Engine {
  constructor (layers = [], opts) {
    this.layers = layers
    this.fps = opts.fps
    this.aspectRatio = opts.aspectRatio
    this.frameSkip = opts.frameSkip
    this.alpha = opts.alpha
    this.canvas = opts.canvas
    this.tick = 0
  }
  animate (debug) {
    let then = Date.now()
    let elapsed
    const fpsInterval = 1000 / this.fps
    let bitmap
    const canvas = this.canvas
    const context = canvas.getContext('2d')
    if (this.layers[0].entry && !this.layers[1].entry) {
      this.alpha[0] = 1
      this.alpha[1] = 0
    }
    if (!this.layers[0].entry && this.layers[1].entry) {
      this.alpha[0] = 0
      this.alpha[1] = 1
    }
    context.imageSmoothingEnabled = false
    canvas.width = SNES_WIDTH
    canvas.height = SNES_HEIGHT
    const image = context.getImageData(0, 0, canvas.width, canvas.height)
    const drawFrame = () => {
      frameID = requestAnimationFrame(drawFrame)
      const now = Date.now()
      elapsed = now - then
      if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval)
        if (debug) {
          console.log(canvas.toDataURL())
        }
        bitmap = renderLayers(this.layers, image.data, this.aspectRatio, this.tick, this.alpha)
        this.tick += this.frameSkip
        image.data.set(bitmap)
        context.putImageData(image, 0, 0)
      }
    }
    if (frameID > 0) {
      cancelAnimationFrame(frameID)
    }
    drawFrame()
  }
}
