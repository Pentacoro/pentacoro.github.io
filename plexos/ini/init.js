import Task from "../lib/classes/system/task.js"
import File from "../lib/classes/files/file.js"

export default function initialize() {
    cfg.desktop.grid = JSON.parse(File.at("/config/desktop/grid.json").data)
    Task.get("system").ini.setVertex("/vertex")
    
    window.onbeforeunload = (e) => {
        e.preventDefault()
        return false
    }
}