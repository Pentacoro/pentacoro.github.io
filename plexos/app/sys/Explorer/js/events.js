import {plexos} from "/plexos/ini/system.js"
import {getTask, runLauncher} from "/plexos/lib/functions/dll.js"
import ContextMenu from "/plexos/lib/classes/interface/contextmenu.js"

let task = getTask(/TASKID/)
let mem  = task.mem

task.onpaste = async function (e) {
	try {
		const urlRegex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,10}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi
        const paste = await navigator.clipboard.readText()

		if (paste.match(urlRegex)){
			let newMetaFile = mem.dirObject.new("Metafile", "New Metafile.meta")
            mem.createExplorerIcons([newMetaFile])
			runLauncher("/plexos/app/meta/Meta Creator/metaCreator.lau.js",{path:newMetaFile.cfg.path,window:false,url:paste,type:"web"})
            newMetaFile.statNode(1)
		}
        
    } catch (err) {
        console.error('Failed to read clipboard contents: ', err)
    }
}

//history back [<]
task.node.getElementsByClassName("back")[0].onclick = e => {

}
//parent dir
task.node.getElementsByClassName("parent")[0].onclick = e => {
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
                runLauncher("/plexos/app/sys/Popup/popup.lau.js",
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
task.node.getElementsByClassName("refresh")[0].onclick = e => {
    mem.refresh()
}

//background click listeners
task.node.getElementsByClassName("list")[0].onmousedown = e => {
    if (e.target.classList.contains("list")) {
        for (let icon of task.pocket) {
            icon.statNode(0)
            task.pocket = task.pocket.remove(icon)
        }
    }
}
task.node.getElementsByClassName("list")[0].oncontextmenu = e => {
    if (e.target.classList.contains("list")) {
        ContextMenu.open(e, task, mem.backContextMenu)
    }
}