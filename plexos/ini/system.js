import cfg from "./config.js"

let plexos = {
    System: {},
    Windows: [],
    Tasks: [],
    sfx: [],
    vtx: {},
    reg: {},
    cfg: cfg,
    dll: {},
}
export {plexos, cfg}

plexos.sfx.push(new Audio("plexos/res/sounds/Norrum - Interfaz Startup 2 v1.mp3"))

import("../lib/functions/prototype.js")
import("./events.js")
import("./core.js")