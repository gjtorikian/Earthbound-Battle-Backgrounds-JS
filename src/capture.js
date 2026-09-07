/* global Blob */
import { GIFEncoder, quantize, applyPalette } from "gifenc";
import BackgroundLayer from "./rom/background_layer";
import { SNES_WIDTH, SNES_HEIGHT, renderLayers } from "./engine";

/*
  Seamless-loop GIF capture.

  The whole animation is a deterministic function of a single frame index:
    - the distortion is computed from the tick value (tick = frame * frameSkip)
    - palette cycling is advanced once per rendered frame (call-count driven)
  so the exact length of a perfect loop can be computed in closed form instead
  of guessed. For one layer:
    - a background's distortion is a sequence of effects, each active for its
      `duration` (measured in game frames, two per engine tick), looping once
      the last duration elapses; the whole distortion state is a pure function
      of the position within that cycle, so it repeats every
      cycle / gcd(cycle, 2 * frameSkip) rendered frames. An effect with a zero
      duration is never switched away from, and its scroll phase realigns
      every  120 / gcd(speed, 120)  ticks (the π/60 constant in Distorter
      means 120 ticks == one full 2π sweep at speed 1); anything played before
      it is a one-shot intro that the warmup has to skip.
    - palette cycling repeats every  interval * modulus  frames, where
      interval = ceil(paletteCycleSpeed / 2) and modulus is the cycle length
      (or its lcm / doubled length for the two-cycle and ping-pong types).
  A single layer's loop is the lcm of those two; the whole scene is the lcm
  across both visible layers.
*/

const MAX_FRAMES = 1800; // safety cap (~60s at 30fps) to bound file size

function gcd(a, b) {
  a = Math.abs(Math.trunc(a));
  b = Math.abs(Math.trunc(b));
  while (b) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a || 1;
}

function lcm(a, b) {
  if (!a || !b) return Math.max(a, b) || 1;
  return Math.abs(Math.trunc(a / gcd(a, b)) * b);
}

/* Number of rendered frames before a single effect's scroll phase realigns. */
function speedFrames(effect, frameSkip) {
  const speed = effect ? Math.abs(Math.trunc(effect.speed)) : 0;
  if (speed === 0) return 1;
  const ticks = 120 / gcd(speed, 120);
  return ticks / gcd(ticks, frameSkip);
}

/* Loop length (in rendered frames) and required warmup for a layer's effect
   sequence; see the header comment. */
function distortionInfo(effects, frameSkip) {
  if (!effects || effects.length === 0) {
    return { frames: 1, warmup: 0, notSeamless: false };
  }
  let cycle = 0;
  for (const effect of effects) {
    if (effect.duration === 0) {
      return {
        frames: speedFrames(effect, frameSkip),
        warmup: Math.ceil(cycle / (2 * frameSkip)),
        notSeamless: hasAcceleration(effect),
      };
    }
    cycle += effect.duration;
  }
  const still =
    effects.length === 1 &&
    !hasAcceleration(effects[0]) &&
    Math.trunc(effects[0].speed) === 0;
  return {
    frames: still ? 1 : cycle / gcd(cycle, 2 * frameSkip),
    warmup: 0,
    notSeamless: false,
  };
}

/* Number of rendered frames before the palette cycle returns to its start. */
function paletteFrames(pc) {
  if (!pc || !pc.speed) return 1;
  const interval = Math.max(1, Math.ceil(pc.speed));
  const len1 = pc.end1 - pc.start1 + 1;
  switch (pc.type) {
    case 1:
      return interval * len1;
    case 2: {
      const len2 = pc.end2 - pc.start2 + 1;
      return interval * lcm(len1, len2);
    }
    case 3:
      return interval * 2 * len1;
    default:
      return 1;
  }
}

function hasAcceleration(effect) {
  // Non-zero acceleration makes amplitude/frequency/compression grow with the
  // tick count. Inside a looping sequence that's bounded (the clock resets
  // when the sequence cycles), but a pinned zero-duration effect runs on one
  // clock forever, so an accelerating one never returns to its start.
  return (
    !!effect &&
    (effect.frequencyAcceleration !== 0 ||
      effect.amplitudeAcceleration !== 0 ||
      effect.compressionAcceleration !== 0)
  );
}

/**
 * Works out the seamless loop length (in rendered frames) for the engine's
 * current layers, plus the color period (over which the set of on-screen
 * colors repeats) used to build a single global palette.
 */
export function computeLoop(engine) {
  const frameSkip = Math.max(1, Number(engine.frameSkip) || 1);
  const layers = engine.layers;
  const alpha = engine.alpha;

  let total = 1;
  let colorPeriod = 1;
  let maxInterval = 1;
  let distortionWarmup = 0;
  let notSeamless = false;
  const contributing = [];

  for (let i = 0; i < layers.length; ++i) {
    const layer = layers[i];
    // entry 0 is the "blank" layer and alpha 0 layers add nothing visible.
    if (!layer || !layer.entry || !(alpha[i] > 0)) continue;
    contributing.push(i);

    const effects = (layer.distorter && layer.distorter.effects) || [];
    const pc = layer.paletteCycle;
    const pf = paletteFrames(pc);
    const dInfo = distortionInfo(effects, frameSkip);

    colorPeriod = lcm(colorPeriod, pf);
    total = lcm(total, lcm(dInfo.frames, pf));
    if (pc && pc.speed)
      maxInterval = Math.max(maxInterval, Math.ceil(pc.speed));
    distortionWarmup = Math.max(distortionWarmup, dInfo.warmup);
    if (dInfo.notSeamless) notSeamless = true;
  }

  // The palette holds its first arrangement for 2*interval-1 frames (the first
  // cycle() fire is a no-op at position 0), versus `interval` frames in steady
  // state. Rendering from a fresh state therefore can't loop; warm past that
  // transient — and past any one-shot distortion intro — so the captured
  // window is purely periodic.
  const warmup = Math.max(2 * maxInterval, distortionWarmup);

  const trueLength = notSeamless ? Infinity : total;

  let frames;
  if (notSeamless) {
    // No clean distortion loop; best we can do is loop the palette animation.
    frames = colorPeriod > 1 ? colorPeriod : 90;
  } else {
    frames = total;
  }

  let truncated = false;
  if (frames > MAX_FRAMES) {
    frames = MAX_FRAMES;
    truncated = true;
  }
  frames = Math.max(1, frames);

  return {
    frames,
    frameSkip,
    colorPeriod,
    warmup,
    contributing,
    notSeamless,
    truncated,
    trueLength,
  };
}

function makeLayers(engine) {
  const rom = engine.layers[0].rom;
  return engine.layers.map((layer) => new BackgroundLayer(layer.entry, rom));
}

const yieldToUI = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Renders the current scene's seamless loop and encodes it as an animated GIF.
 */
export async function captureLoopGif(engine, onProgress) {
  const info = computeLoop(engine);
  const { frames, frameSkip, colorPeriod, warmup } = info;
  const letterbox = engine.aspectRatio;
  const alpha = engine.alpha;
  const fps = Number(engine.fps) || 30;
  const delay = Math.round(1000 / fps);

  const W = SNES_WIDTH;
  const H = SNES_HEIGHT;
  const buf = new Uint8ClampedArray(W * H * 4);

  // Pass 1 — collect every color that appears over the color period.
  // (Distortion only relocates pixels, so the palette period bounds the colors.)
  // `warmup` throwaway frames skip the palette's startup transient.
  const sample = Math.min(frames, colorPeriod);
  const colorSet = new Set();
  let layers = makeLayers(engine);
  for (let j = 0; j < warmup + sample; ++j) {
    renderLayers(layers, buf, letterbox, j * frameSkip, alpha);
    if (j < warmup) continue;
    for (let k = 0; k < buf.length; k += 4) {
      colorSet.add(((buf[k] << 16) | (buf[k + 1] << 8) | buf[k + 2]) >>> 0);
    }
    if ((j & 7) === 0) await yieldToUI();
  }

  let palette;
  if (colorSet.size <= 256) {
    palette = [];
    for (const key of colorSet) {
      palette.push([(key >> 16) & 255, (key >> 8) & 255, key & 255]);
    }
  } else {
    const unique = [...colorSet];
    const samp = new Uint8Array(unique.length * 4);
    for (let i = 0; i < unique.length; ++i) {
      const key = unique[i];
      samp[i * 4] = (key >> 16) & 255;
      samp[i * 4 + 1] = (key >> 8) & 255;
      samp[i * 4 + 2] = key & 255;
      samp[i * 4 + 3] = 255;
    }
    palette = quantize(samp, 256, { format: "rgb565" });
  }

  // Pass 2 — render the full loop and encode against the global palette.
  const gif = GIFEncoder();
  layers = makeLayers(engine);
  for (let j = 0; j < warmup + frames; ++j) {
    renderLayers(layers, buf, letterbox, j * frameSkip, alpha);
    if (j < warmup) continue;
    const captured = j - warmup;
    const index = applyPalette(buf, palette, "rgb565");
    // Write the palette (global color table) + loop flag only on the first
    // frame; later frames reuse it, keeping the file small.
    gif.writeFrame(
      index,
      W,
      H,
      captured === 0 ? { palette, delay, repeat: 0 } : { delay },
    );
    if (onProgress) onProgress((captured + 1) / frames);
    if ((j & 7) === 0) await yieldToUI();
  }
  gif.finish();

  const blob = new Blob([gif.bytes()], { type: "image/gif" });
  return { ...info, blob, colors: palette.length };
}
