import {plexos} from "./system.js"

import Task from "../lib/classes/system/task.js"
import File from "../lib/classes/filesystem/file.js"

export default function initialize() {
    Task.get("System").ini.setVertex("/user/desks/desktop")
    console.log(plexos.core)
    
    window.onbeforeunload = (e) => {
        e.preventDefault()
        return false
    }
}