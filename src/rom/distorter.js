import {
  HORIZONTAL,
  HORIZONTAL_INTERLACED,
  VERTICAL,
  asInt16,
} from "./distortion_effect";
import { SNES_WIDTH, SNES_HEIGHT } from "../engine";
const { PI: π, sin, round, floor } = Math;
const R = 0;
const G = 1;
const B = 2;
const A = 3;
function mod(n, m) {
  return ((n % m) + m) % m;
}
export default class Distorter {
  constructor(bitmap) {
    this.bitmap = bitmap;
    /* The sequence of up to four DistortionEffects associated with a background entry; see effectState() for how they are cycled */
    this.effects = [];
    this.C1 = 1 / 512;
    this.C2 = (8 * π) / (1024 * 256);
    this.C3 = π / 60;
  }
  setOffsetConstants(ticks, effect) {
    const {
      amplitude,
      amplitudeAcceleration,
      compression,
      compressionAcceleration,
      frequency,
      frequencyAcceleration,
      speed,
    } = effect;
    /* Compute "current" values of amplitude, frequency and compression.
       The SNES accumulates these in 16-bit registers, so they wrap around;
       the paired effects in the ROM rely on that wraparound to line up
       seamlessly (e.g. one effect ends its amplitude ramp at 80 * 500 = 40000,
       which wraps to -25536 — exactly where its partner effect begins). */
    const t2 = ticks * 2;
    this.amplitude = this.C1 * asInt16(amplitude + amplitudeAcceleration * t2);
    this.frequency = this.C2 * asInt16(frequency + frequencyAcceleration * t2);
    this.compression =
      1 + asInt16(compression + compressionAcceleration * t2) / 256;
    this.speed = this.C3 * speed * ticks;
    this.S = (y) =>
      round(this.amplitude * sin(this.frequency * y + this.speed));
  }
  /**
   * Selects which effect of the background's sequence is active at the given
   * time, and how long it has been active. Durations are measured in game
   * frames, two per engine tick (the same doubling as t2 in
   * setOffsetConstants). Each effect's clock restarts when it becomes active,
   * and the sequence repeats once the last effect's duration elapses — this
   * looping is what keeps accelerating effects (e.g. the Giygas backgrounds)
   * from distorting indefinitely. An effect with a zero duration is never
   * switched away from.
   * @param ticks
   *   The number of engine ticks since beginning animation
   * @return
   *   A [effect, ticks] pair: the active effect and its local tick value
   */
  effectState(ticks) {
    const effects = this.effects;
    if (effects.length === 0) {
      return [this.effect, ticks];
    }
    let t = ticks * 2;
    let cycle = 0;
    let terminal = null;
    for (const effect of effects) {
      if (effect.duration === 0) {
        terminal = effect;
        break;
      }
      cycle += effect.duration;
    }
    if (terminal === null) {
      t = mod(t, cycle);
    } else if (t >= cycle) {
      return [terminal, (t - cycle) / 2];
    }
    for (const effect of effects) {
      if (t < effect.duration) {
        return [effect, t / 2];
      }
      t -= effect.duration;
    }
    return [effects[0], t / 2];
  }
  overlayFrame(dst, letterbox, ticks, alpha, erase) {
    const [effect, effectTicks] = this.effectState(ticks);
    return this.computeFrame(
      dst,
      this.bitmap,
      letterbox,
      effectTicks,
      alpha,
      erase,
      effect,
    );
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
  getAppliedOffset(y, distortionEffect) {
    const s = this.S(y);
    switch (distortionEffect) {
      default:
      case HORIZONTAL:
        return s;
      case HORIZONTAL_INTERLACED:
        return y % 2 === 0 ? -s : s;
      case VERTICAL:
        /* Compute L */
        return mod(floor(s + y * this.compression), 256);
    }
  }
  computeFrame(
    destinationBitmap,
    sourceBitmap,
    letterbox,
    ticks,
    alpha,
    erase,
    effect,
  ) {
    const { type: distortionEffect } = effect;
    const newBitmap = destinationBitmap;
    const oldBitmap = sourceBitmap;
    /* TODO: Hardcoing is bad */
    const dstStride = 1024;
    const srcStride = 1024;
    let x, y, bPos, sPos, dx;
    this.setOffsetConstants(ticks, effect);
    for (y = 0; y < SNES_HEIGHT; ++y) {
      const offset = this.getAppliedOffset(y, distortionEffect);
      const L = distortionEffect === VERTICAL ? offset : y;
      for (x = 0; x < SNES_WIDTH; ++x) {
        bPos = x * 4 + y * dstStride;
        if (y < letterbox || y > SNES_HEIGHT - letterbox) {
          newBitmap[bPos + R] = 0;
          newBitmap[bPos + G] = 0;
          newBitmap[bPos + B] = 0;
          newBitmap[bPos + A] = 255;
          continue;
        }
        dx = x;
        if (
          distortionEffect === HORIZONTAL ||
          distortionEffect === HORIZONTAL_INTERLACED
        ) {
          dx = mod(x + offset, SNES_WIDTH);
        }
        sPos = dx * 4 + L * srcStride;
        /* Either copy or add to the destination bitmap */
        if (erase) {
          newBitmap[bPos + R] = alpha * oldBitmap[sPos + R];
          newBitmap[bPos + G] = alpha * oldBitmap[sPos + G];
          newBitmap[bPos + B] = alpha * oldBitmap[sPos + B];
          newBitmap[bPos + A] = 255;
        } else {
          newBitmap[bPos + R] += alpha * oldBitmap[sPos + R];
          newBitmap[bPos + G] += alpha * oldBitmap[sPos + G];
          newBitmap[bPos + B] += alpha * oldBitmap[sPos + B];
          newBitmap[bPos + A] = 255;
        }
      }
    }
    return newBitmap;
  }
}
