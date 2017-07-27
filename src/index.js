import ROM from "./rom/rom";
import data from "../data/backgrounds.dat";
export Engine from "./engine";
export BackgroundLayer from "./rom/background_layer";
const backgroundData = new Uint8Array(Array.from(data).map(x => x.charCodeAt(0)));
new ROM(backgroundData);
