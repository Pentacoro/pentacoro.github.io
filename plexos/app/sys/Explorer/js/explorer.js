import {getTask, runLauncher} from "/plexos/lib/functions/dll.js"
import File from "/plexos/lib/classes/filesystem/file.js"
import Task from "/plexos/lib/classes/system/task.js"
import Icon from "/plexos/lib/classes/interface/icon.js"

let task = getTask(/TASKID/)
let mem  = task.mem
task.apps = "exp"
mem.iconArray = []
mem.dirObject = {}

//local functions
mem.createExplorerIcons = async function(array) {
    for(let item of array) {
        if (mem.getIcon(item.cfg.path)) {
			mem.getIcon(item.cfg.path).render()
		} else{
            let itemIcon = item.cfg.icon
            let dirIcon  = new mem.class.IconDir(itemIcon)
            mem.iconArray.push(dirIcon)
            dirIcon.createNode()
		}
    }
}
mem.refresh = function () {
    return mem.explorerInit(mem.dirObject.cfg.path, task.id, "refresh")
}
mem.passesFilter = function (file) {
    if (!mem.typeFilter) return true
    if (file.cfg.system || file.cfg.class === "ProxyFile") return true
    return mem.typeFilter.includes(file.cfg.exte?.toLowerCase())
}
mem.getIcon = function(path){
    let find = mem.iconArray.filter(icon => icon.file === path)
    return ((find.length>0) ? find[0] : null)
}
const home = "@/home"

// The folder on view, or the one asked for, is gone. Say so, then show the user folder
mem.folderLost = function () {
    task.popup(null, [["OK"]], {
        name: "Error",
        type: false,
        title: "Directory not found",
        description: "This directory seems to no longer exist. It might have been deleted, moved, or a parent directory been renamed",
        icon: "",
    })
    const fallback = File.at(home) ? home : File.root
    return mem.navigate(fallback)
}
// Whether the folder on view is path or sits somewhere inside it
mem.showsPath = function (path) {
    return mem.address === path || String(mem.address).startsWith(path + "/")
}
// After a transfer into this folder, select what arrived. The moves already drew it at the end of the list,
// where it stays until a refresh sorts it
mem.selectArrivals = function (to, moved) {
    if (mem.address !== to) return
    for (const icon of [...task.pocket]) {
        task.pocket = task.pocket.remove(icon)
        icon.statNode(0)
    }
    for (const path of moved) mem.getIcon(path)?.statNode(1)
}
mem.explorerInit = function (dir, id, act = null) {
    if (File.at(dir)?.cfg?.class !== "DirectoryFile") return mem.folderLost()
    mem.loadFolderView(dir)
    try {
        let activeObj = File.at(dir)
        let dirList   = File.children(activeObj).map(file => [file.name, file]) // the bin holds wrappers, not a name map

        let dirFolder = []
        let dirFile   = []
        let dirPlex   = []

        for (let icon of task.mem.iconArray){
            mem.ui.view.keyNodes.list.removeChild(icon.node)
        }

        task.mem.iconArray = []
        task.mem.address = dir
        task.mem.dirObject = File.at(dir)
        task.mem.var.dirname = activeObj.name
        task.pocket = []

        for (let item of dirList) {
            if(item[1].cfg.class === "DirectoryFile" && !item[1].cfg.system) {
                dirFolder.push(item[1])
            }
        }
        for (let item of dirList) {
            if(item[1].cfg.class !=  "DirectoryFile" && mem.passesFilter(item[1])) {
                dirFile.push(item[1])
            }
        }
        for (let item of dirList) {
            if(item[1].cfg.system) {
                dirPlex.push(item[1])
            }
        }

        dirFolder.sort((a, b) => a.name.localeCompare(b.name))
        dirFile.sort  ((a, b) => a.name.localeCompare(b.name))
        dirPlex.sort  ((a, b) => a.name.localeCompare(b.name))

        mem.ui.nav.keyNodes.address.value = dir
        mem.markSidePanel?.()

        if (!mem.arg.mode) {
            task.window.setTitle(activeObj.name)
            task.window.setImage(activeObj.cfg.icon.getImage())
        }

        return mem.createExplorerIcons(dirPlex)
            .then(e => mem.createExplorerIcons(dirFolder))
            .then(e => mem.createExplorerIcons(dirFile))
            .then(e => mem.applySort())
        
    } catch (e) {
        console.error(e)
        mem.folderLost()
    }
}
//Delete sends the selection to the bin. What's already in the bin goes for good, after asking (bin.js)
mem.deleteSelectedNodes = function(){
	const icons = Task.unlockedIcons(task.pocket, task)
	const recycled = icons.filter(icon => File.inBin(icon.file))
	Task.recycleIcons(icons.filter(icon => !File.inBin(icon.file)), task)
	if (recycled.length) mem.deleteForGood(recycled.map(icon => icon.file))
}
mem.new = async function(e, _this, Type, name){
    if (File.isBin(mem.dirObject)) return // nothing is made in the bin
    let editFrom = mem.dirObject
    let classDefaults = File.classDefaults(Type)

    async function createExplorerFile(name) {
		if(File.nameAvailable(name, null, editFrom)) {
            let newFileIcon = new Icon (
                {
					name : name,
					class : classDefaults.confType,
					state : 0
				}
            )
			await task.cmd("file.create", {path: editFrom.cfg.path, Type: Type, name: name, newFileIcon: newFileIcon})
            const created = editFrom.dir[name]
            if (!created) return null
            created.render()
            return created
		} else {
			let exte = name.match(/\.(?:.(?<!\.))+$/s)
			exte = (exte!=null && exte.length > 0) ? exte[0] : ""
			name = name.replace(exte,"")
			let amnt = name.match(/(?<!\w)\d+$/)
			amnt = (amnt!=null && amnt.length > 0) ? parseInt(amnt[0],10) : ""
			let dgts = (amnt!="") ? (""+amnt).length : 1
			name = (amnt!="") ? name.slice(0,(name.length)-dgts) + (amnt+1) : name + " 2"
			name = name + exte
			return createExplorerFile(name)
		}
	}
    
    const created = await createExplorerFile(name)
    if (!created) return
    mem.getIcon(created.cfg.path)?.editName()
}