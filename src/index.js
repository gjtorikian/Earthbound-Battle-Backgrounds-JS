import Rom from "./rom/rom";
import data from "../data/truncated_backgrounds.dat";
import Engine from "./engine";
import BackgroundLayer from "./rom/background_layer";
const backgroundData = new Uint8Array(Array.from(data).map(x => x.charCodeAt(0)));

export const ROM = new Rom(backgroundData)

var setupEngine = exports.setupEngine = function setupEngine() {
  var params = getJsonFromUrl(), loader = null;

  var layer1_val = parseLayerParam(params.layer1, { firstLayer: true });
  var layer2_val = parseLayerParam(params.layer2, { firstLayer: false });
  var frameskip = parseFrameskipParam(params.frameskip);
  var aspectRatio = parseAspectRatioParam(params.aspectRatio);
  parseFullscreen(params.fullscreen);

  var fps = 30;
  var alpha = parseFloat(0.5);

  if (layer2_val == 0)
    alpha = parseFloat(1.0);

  // Create two layers
  document.BackgroundLayer = BackgroundLayer;
  const layer1 = new document.BackgroundLayer(layer1_val, ROM);
  const layer2 = new document.BackgroundLayer(layer2_val, ROM);

  // Create animation engine
  const engine = new Engine([layer1, layer2], {
    fps: fps,
    aspectRatio: aspectRatio,
    frameSkip: frameskip,
    alpha: [alpha, alpha],
  	canvas: document.querySelector("canvas")
  });

  document.engine = engine;
  document.engine.animate();
}

setupEngine();
