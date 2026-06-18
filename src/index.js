import Rom from "./rom/rom";
import backgroundData from "../data/truncated_backgrounds.dat?uint8array&base64";
import Engine from "./engine";
import BackgroundLayer from "./rom/background_layer";
import { captureLoopGif } from "./capture";

const ROM = new Rom(backgroundData);
globalThis.ROM = ROM;

var setupEngine = (function setupEngine() {
  let params = getJsonFromUrl();
  let loader = null;

  let layer1Val = parseLayerParam(params.layer1, { firstLayer: true });
  let layer2Val = parseLayerParam(params.layer2, { firstLayer: false });
  let frameskip = parseFrameskipParam(params.frameskip);
  let aspectRatio = parseAspectRatioParam(params.aspectRatio);
  parseFullscreen(params.fullscreen);
  let debug = params.debug === "true";

  let fps = 30;
  let alpha = parseFloat(0.5);

  if (layer2Val === 0) {
    alpha = parseFloat(1.0);
  }

  // Create two layers
  document.BackgroundLayer = BackgroundLayer;
  const layer1 = new document.BackgroundLayer(layer1Val, ROM);
  const layer2 = new document.BackgroundLayer(layer2Val, ROM);

  // Create animation engine
  const engine = new Engine([layer1, layer2], {
    fps: fps,
    aspectRatio: aspectRatio,
    frameSkip: frameskip,
    alpha: [alpha, alpha],
    canvas: document.querySelector("canvas")
  });

  document.engine = engine;
  document.engine.animate(debug);
});
globalThis.setupEngine = setupEngine;

setupEngine();

// Wire the "Save looping GIF" button once. It reads document.engine at click
// time, so it always captures whatever is currently on screen.
(function wireGifButton() {
  const button = document.getElementById("saveGif");
  const status = document.getElementById("gifStatus");
  if (!button) return;

  button.addEventListener("click", async () => {
    if (button.dataset.busy) return;
    button.dataset.busy = "1";
    const label = button.textContent;
    button.classList.add("o-50");
    button.textContent = "Working…";
    if (status) status.textContent = "Computing loop…";

    try {
      const result = await captureLoopGif(document.engine, (frac) => {
        if (status) status.textContent = `Rendering loop… ${Math.round(frac * 100)}%`;
      });

      const l1 = document.engine.layers[0].entry;
      const l2 = document.engine.layers[1].entry;
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `earthbound-bg-${l1}-${l2}.gif`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      const seconds = (result.frames / (Number(document.engine.fps) || 30)).toFixed(1);
      let message = `Saved a ${result.frames}-frame loop (~${seconds}s).`;
      if (result.notSeamless) {
        message +=
          " Heads up: this background's distortion accelerates over time, so it can't loop perfectly — looped its palette animation instead.";
      } else if (result.truncated) {
        message += ` Its exact loop is ${result.trueLength} frames; capped at ${result.frames}. Bump Frameskip up for a shorter exact loop.`;
      }
      if (status) status.textContent = message;
    } catch (error) {
      console.error(error);
      if (status) status.textContent = `Sorry, GIF capture failed: ${error.message}`;
    } finally {
      button.textContent = label;
      button.classList.remove("o-50");
      delete button.dataset.busy;
    }
  });
})();
