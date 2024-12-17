import {plexos} from "./system.js"

import Task from "../lib/classes/system/task.js"
import File from "../lib/classes/files/file.js"

export default function initialize() {
    plexos.cfg.desktop.grid = JSON.parse(File.at("/plexos/cfg/desktop/grid.json").data)
    Task.get("System").ini.setVertex("/vertex")
    console.log(plexos.core)
    
    window.onbeforeunload = (e) => {
        e.preventDefault()
        return false
    }
}