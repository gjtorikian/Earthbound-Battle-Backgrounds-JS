import ROM from "./rom/rom";
import data from "../data/truncated_backgrounds.dat";
import Engine from "./engine";
import BackgroundLayer from "./rom/background_layer";
const backgroundData = new Uint8Array(Array.from(data).map(x => x.charCodeAt(0)));
new ROM(backgroundData);

// document.addEventListener("DOMContentLoaded", function(event) {
/* Create two layers */

document.BackgroundLayer = BackgroundLayer;

const layer1 = new document.BackgroundLayer(270);
const layer2 = new document.BackgroundLayer(269);
/* Create animation engine  */
const engine = new Engine([layer1, layer2], {
	canvas: document.querySelector("canvas")
});
document.engine = engine;
document.engine.animate();
// });
