import { HORIZONTAL, HORIZONTAL_INTERLACED, VERTICAL } from './distortion_effect'
import { SNES_WIDTH, SNES_HEIGHT } from '../engine'
const { PI: π, sin, round, floor } = Math
const R = 0
const G = 1
const B = 2
const A = 3
function mod (n, m) {
  return ((n % m) + m) % m
}
export default class Distorter {
  constructor (bitmap) {
    // There is some redundancy here: 'effect' is currently what is used
    // in computing frames, although really there should be a list of
    // four different effects ('dist') which are used in sequence.
    //
    // 'distortions' is currently unused, but ComputeFrame should be changed to
    // make use of it as soon as the precise nature of effect sequencing
    // can be determined.
    //
    // The goal is to make Distorter a general-purpose BG effect class that
    // can be used to show either a single distortion effect, or to show the
    // entire sequence of effects associated with a background entry (including
    // scrolling and Palette animation, which still need to be implemented).
    //     this.distortions = Array(4).fill(new DistortionEffect());
    this.bitmap = bitmap
    /* NOTE: Another discrepancy from Java: These values should be "short" and must have a specific precision. This seems to affect backgrounds with distortEffect === HORIZONTAL */
    this.C1 = 1 / 512
    this.C2 = 8 * π / (1024 * 256)
    this.C3 = π / 60
  }
  setOffsetConstants (ticks, effect) {
    const {
      amplitude,
      amplitudeAcceleration,
      compression,
      compressionAcceleration,
      frequency,
      frequencyAcceleration,
      speed
    } = effect
    /* Compute "current" values of amplitude, frequency and compression */
    const t2 = ticks * 2
    this.amplitude = this.C1 * (amplitude + amplitudeAcceleration * t2)
    this.frequency = this.C2 * (frequency + (frequencyAcceleration * t2))
    this.compression = 1 + (compression + (compressionAcceleration * t2)) / 256
    this.speed = this.C3 * speed * ticks
    this.S = y => round(this.amplitude * sin(this.frequency * y + this.speed))
  }
  overlayFrame (dst, letterbox, ticks, alpha, erase) {
    return this.computeFrame(dst, this.bitmap, letterbox, ticks, alpha, erase, this.effect)
  }
  /**
  * Evaluates the distortion effect at the given destination line and
  * time value and returns the computed offset value.
  * If the distortion mode is horizontal, this offset should be interpreted
  * as the number of pixels to offset the given line's starting x position.
  * If the distortion mode is vertical, this offset should be interpreted as
  * the y-coordinate of the line from the source bitmap to draw at the given
  * y-coordinate in the destination bitmap.
  * @param y
  *   The y-coordinate of the destination line to evaluate for
  * @param t
  *   The number of ticks since beginning animation
  * @return
  *   The distortion offset for the given (y, t) coordinates
  */
  getAppliedOffset (y, distortionEffect) {
    const s = this.S(y)
    switch (distortionEffect) {
      default:
      case HORIZONTAL:
        return s
      case HORIZONTAL_INTERLACED:
        return y % 2 === 0 ? -s : s
      case VERTICAL:
        /* Compute L */
        return mod(floor(s + y * this.compression), 256)
    }
  }
  computeFrame (destinationBitmap, sourceBitmap, letterbox, ticks, alpha, erase, effect) {
    const { type: distortionEffect } = effect
    const newBitmap = destinationBitmap
    const oldBitmap = sourceBitmap
    /* TODO: Hardcoing is bad */
    const dstStride = 1024
    const srcStride = 1024
    /*
      Given the list of 4 distortions and the tick count, decide which
      effect to use:
      Basically, we have 4 effects, each possibly with a duration.
      Evaluation order is: 1, 2, 3, 0
      If the first effect is null, control transitions to the second effect.
      If the first and second effects are null, no effect occurs.
      If any other effect is null, the sequence is truncated.
      If a non-null effect has a zero duration, it will not be switched
      away from.
      Essentially, this configuration sets up a precise and repeating
      sequence of between 0 and 4 different distortion effects. Once we
      compute the sequence, computing the particular frame of which distortion
      to use becomes easy; simply mod the tick count by the total duration
      of the effects that are used in the sequence, then check the remainder
      against the cumulative durations of each effect.
      I guess the trick is to be sure that my description above is correct.
      Heh.
    */
    let x, y, bPos, sPos, dx
    this.setOffsetConstants(ticks, effect)
    for (y = 0; y < SNES_HEIGHT; ++y) {
      const offset = this.getAppliedOffset(y, distortionEffect)
      const L = distortionEffect === VERTICAL ? offset : y
      for (x = 0; x < SNES_WIDTH; ++x) {
        bPos = x * 4 + y * dstStride
        if (y < letterbox || y > SNES_HEIGHT - letterbox) {
          newBitmap[bPos + R] = 0
          newBitmap[bPos + G] = 0
          newBitmap[bPos + B] = 0
          newBitmap[bPos + A] = 255
          continue
        }
        dx = x
        if (distortionEffect === HORIZONTAL || distortionEffect === HORIZONTAL_INTERLACED) {
          dx = mod(x + offset, SNES_WIDTH)
        }
        sPos = dx * 4 + L * srcStride
        /* Either copy or add to the destination bitmap */
        if (erase) {
          newBitmap[bPos + R] = alpha * oldBitmap[sPos + R]
          newBitmap[bPos + G] = alpha * oldBitmap[sPos + G]
          newBitmap[bPos + B] = alpha * oldBitmap[sPos + B]
          newBitmap[bPos + A] = 255
        } else {
          newBitmap[bPos + R] += alpha * oldBitmap[sPos + R]
          newBitmap[bPos + G] += alpha * oldBitmap[sPos + G]
          newBitmap[bPos + B] += alpha * oldBitmap[sPos + B]
          newBitmap[bPos + A] = 255
        }
      }
    }
    return newBitmap
  }
}
