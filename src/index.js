import ROM from "./rom/rom";
import data from "../data/truncated_backgrounds.dat";
import Engine from "./engine";
import BackgroundLayer from "./rom/background_layer";
const backgroundData = new Uint8Array(Array.from(data).map(x => x.charCodeAt(0)));
new ROM(backgroundData);

var setupEngine = exports.setupEngine = function setupEngine() {

  var params = getJsonFromUrl(), loader = null;

  // what is this second Number parse for? "0" is a valid number, but it yields false in the || statement!
  var layer1_val = Number(parseLayerParam(params.layer1) || 270);
  var layer2_val = Number(parseLayerParam(params.layer2) || 269);
  var frameskip = parseFrameskip(params.frameskip) || 1;
  var aspectRatio = Number(parseAspectRatioParam(params.aspectRatio) || 0);

  var fps = 30;
  var alpha = parseFloat(0.5);

  if (layer2_val == 0)
    alpha = parseFloat(1.0);

  // Create two layers
  document.BackgroundLayer = BackgroundLayer;
  const layer1 = new document.BackgroundLayer(layer1_val);
  const layer2 = new document.BackgroundLayer(layer2_val);

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
