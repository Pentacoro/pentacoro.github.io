import {getTask, runLauncher} from "/plexos/lib/functions/dll.js"
import File from "/plexos/lib/classes/filesystem/file.js"
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
    mem.explorerInit(mem.dirObject.cfg.path, task.id, "refresh")
}
mem.getIcon = function(path){
    let find = mem.iconArray.filter(icon => icon.file === path)
    return ((find.length>0) ? find[0] : null)
}
mem.explorerInit = function (dir, id, act = null) {    
    try {       
        let activeObj = File.at(dir)
        let dirList   = Object.entries(activeObj.dir)

        let dirFolder = []
        let dirFile   = []
        let dirPlex   = []

        for (let icon of task.mem.iconArray){
            task.node.getElementsByClassName("list")[0].removeChild(icon.node)
        }

        task.mem.iconArray = []
        task.mem.address = dir
        task.mem.dirObject = File.at(dir)
        task.mem.var.dirname = activeObj.name
        task.pocket = []

        for (let item of dirList) {
            if(item[1].cfg.class === "Directory" && !item[1].cfg.system) {
                dirFolder.push(item[1])
            }
        }
        for (let item of dirList) {
            if(item[1].cfg.class !=  "Directory") {
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

        task.node.getElementsByClassName("address")[0].innerHTML = dir

        task.window.setTitle(activeObj.name)
        task.window.setImage(activeObj.cfg.icon.getImage())

        mem.createExplorerIcons(dirPlex).then( e => mem.createExplorerIcons(dirFolder).then(e => mem.createExplorerIcons(dirFile)))
        
    } catch (e) {
        task.popup(e,[["OK"]],{
            name:"Error",
            type:false,
            title:"Directory not found",
            description:"This directory seems to no longer exist. It might have been deleted, moved, or a parent directory been renamed",
            taskid:task.id,
            icon:""
        })
        if (act === "refresh") mem.explorerInit("", task.id)
    }
}
mem.deleteSelectedNodes = function(){
	for(let icon of task.pocket){
		icon.deleteNode()
		//delete from filesystem
		if(File.at(icon.file)!=undefined) File.at(icon.file).delete()
	}
}
mem.new = function(e, _this, Type, name){
    let editFrom = mem.dirObject
    let classDefaults = File.classDefaults(Type)

    function createExplorerFile(name) {
		if(File.nameAvailable(name, null, editFrom)) {
            let newFileIcon = new Icon (
                {
					name : name,
					class : classDefaults.confType,
					state : 0
				}
            )
			editFrom.new(Type,name,newFileIcon)
            editFrom.dir[name].render(task.id)
            return newFileIcon
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
    
    let newFileIcon = createExplorerFile(name)

    let createdIcon = mem.iconArray[mem.iconArray.length - 1]
    createdIcon.editName()
}