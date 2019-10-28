import Rom from "./rom/rom";
import data from "../data/truncated_backgrounds.dat";
import Engine from "./engine";
import BackgroundLayer from "./rom/background_layer";
const backgroundData = new Uint8Array(
  Array.from(data).map(x => x.charCodeAt(0))
);

export const ROM = new Rom(backgroundData);

var setupEngine = (exports.setupEngine = function setupEngine() {
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

setupEngine();
