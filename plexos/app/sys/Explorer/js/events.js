import plexos from "/plexos/ini/system.js"
import {getTask, runLauncher} from "/plexos/lib/functions/dll.js"
import ContextMenu from "/plexos/lib/classes/interface/contextmenu.js"

let task = getTask(/TASKID/)
let mem  = task.mem
let nav  = mem.ui.nav.keyNodes
let list = mem.ui.view.keyNodes.list

document.addEventListener("keydown", async (e) => {
    if (plexos.System.mem.focused !== task) return
    if (!e.ctrlKey) return
    if (e.target?.isContentEditable) return
    const key = e.key.toLowerCase()
    if (key !== "z" && key !== "y") return
    e.preventDefault()
    if (key === "y" || (key === "z" && e.shiftKey)) {
        await plexos.Core.changeLog.redoExplorer()
    } else {
        await plexos.Core.changeLog.undoExplorer()
    }
})

task.onpaste = async function (e) {
	try {
		const urlRegex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,10}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi
        const paste = await navigator.clipboard.readText()

		if (paste.match(urlRegex)){
			let newMetaFile = await task.cmd("file.create", {path: mem.dirObject.cfg.path, Type: "MetaFile", name: "New MetaFile.meta"})
            mem.createExplorerIcons([newMetaFile])
            let icon = mem.getIcon(newMetaFile.cfg.path)
			runLauncher("/plexos/app/meta/Meta Creator/metaCreator.ls",{path:newMetaFile.cfg.path,window:false,url:paste,type:"web"})
            icon.statNode(1)
		}
        
    } catch (err) {
        console.error('Failed to read clipboard contents: ', err)
    }
}

//history back [<]
nav.back.onclick = e => {

}
//parent dir
nav.up.onclick = e => {
    if (mem.address !== "") {
        try {
            mem.explorerInit(mem.dirObject.parent().cfg.path, task.id)
        } catch (e1) {
            try {
                let newDir = mem.address.replace(/\/(?:.(?!\/))+$/gim, "")
                mem.explorerInit(newDir, task.id)
            } catch (e) {
                mem.var.error  = e
                mem.var.errorB = [["Okay"]]
                runLauncher("/plexos/app/sys/Popup/popup.ls",
                    {
                     name:"Error",
                     type:false,
                     title:"Couldn't load directory",
                     description:"This directory seems to no longer exist. It might have been deleted, moved, or a parent directory been renamed",
                     taskid:task.id,
                     icon:""
                    }
                )

                mem.explorerInit("", task.id)
            }
        }
    } else {
        mem.explorerInit(mem.address, task.id)
    }
}
//refresh
nav.refresh.onclick = e => {
    mem.refresh()
}

//background click listeners
list.onmousedown = e => {
    if (e.target === list) {
        for (let icon of task.pocket) {
            icon.statNode(0)
            task.pocket = task.pocket.remove(icon)
        }
    }
}
list.oncontextmenu = e => {
    if (e.target === list) {
        ContextMenu.open(e, task, mem.backContextMenu)
    }
}