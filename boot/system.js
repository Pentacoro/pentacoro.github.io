import plexos from "./plexos.js"

import Task from "../plexos/lib/classes/system/task.js"
import EventBus from "../plexos/lib/classes/system/eventbus.js"
import File from "../plexos/lib/classes/filesystem/file.js"
import ProxyFile from "../plexos/lib/classes/filesystem/proxy.js"
import Icon from "../plexos/lib/classes/interface/icon.js"
import ChangeLog from "../plexos/lib/classes/system/changeLog.js"

// SYSTEM TASK
const sys = new Task(
    {
		name : "System",
		onEnd : null,
		node : null,
		from : "System"
	}
)
plexos.System = sys
sys.mem.lau = {}
sys.mem.var.dragging = false
sys.mem.var.shSelect = true
sys.mem.focused = null
sys.mem.cfg = plexos.Config
sys.mem.downloadCoreJSON = function (exportName="core") { // serialized tree, not the live Core Task
    let jsonCore = File.serializeNode(plexos.Core.file)
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonCore))
    let downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href",     dataStr)
    downloadAnchorNode.setAttribute("download", exportName + ".json")
    document.body.appendChild(downloadAnchorNode) // required for firefox
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
}
sys.bus = new EventBus()
window.addEventListener("resize", () => {
	sys.bus.emit("viewport-resize")
})

// CORE TASK
const core = new Task(
    {
		name : "Core",
		onEnd : null,
		node : null,
		from : "System"
	}
)
plexos.Core = core
core.file = {}
core.changeLog = new ChangeLog()
core.mem.explorerUndoIndex = -1
core.mem.classCompilers = {
    "ProxyFile": (file) => {
        return ProxyFile.unwrapProxy(file.data)
    }
}
core.ini = {}
core.ini.recreateFiles = async function (dir, newDir) {
    for (let file of Object.values(dir.dir)) {
        let Type = null 
        let Skey = "data"

        switch (file.cfg.class) {
            case "DirectoryFile":
                Type = "DirectoryFile"
                Skey = "dir"
                break
            case "MetaFile":
                Type = "MetaFile"
                Skey = "meta"
                break
            case "StringFile":
                Type = "StringFile"
                break 
            case "ProxyFile":
                Type = "ProxyFile"
                break 
            default:
                Type = "StringFile"
                Skey = "data"
                break 
        }

        //recreate file object
        await File.create({
            path: newDir.cfg.path,
            Type,
            name: file.name,
            conf: file.cfg,
            content: file[Skey],
        })
        let newFile = newDir.dir[file.name]
        
        //recreate icon object
        let oldIcon = newFile.cfg.icon
        oldIcon.exte = newFile.cfg.exte
        newFile.cfg.icon = new Icon (oldIcon)

        if (Type === "DirectoryFile") {
            newFile.dir = {}
            await core.ini.recreateFiles(dir.dir[file.name], newFile)
        }
    }
}

core.mem.saveCore = async function () {
    await plexos.db.saveCore(core.file)
}
