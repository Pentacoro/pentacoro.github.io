import {getTask, runLauncher} from "/plexos/lib/functions/dll.js"
import Task from "/plexos/lib/classes/system/task.js"
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
        let itemIcon = item.cfg.icon
        let dirIcon  = new mem.class.IconDir(
            {           
                image : itemIcon.image,
                name : itemIcon.name,
                task : task.id,
                exte : itemIcon.exte,
                file : itemIcon.file
            }
        )
        mem.iconArray.push(dirIcon)
        
        dirIcon.createNode()
    }
}
mem.refresh = function () {
    mem.explorerInit(mem.dirObject.cfg.path, task.id, "refresh")
}
mem.getIcon = function(name){
    let find = mem.iconArray.filter(icon => icon.name === name)
    return find[0]
}
mem.explorerInit = function (dir, id, act = null) {    
    try {       
        let activeObj = File.at(dir)
        let dirList   = Object.entries(activeObj.dir)

        let dirFolder = []
        let dirFile   = []
        let dirPlex   = []

        for (let icon of Task.id(id).mem.iconArray){
            task.node.getElementsByClassName("list")[0].removeChild(icon.node)
        }

        Task.id(id).mem.iconArray = []
        Task.id(id).mem.address = dir
        Task.id(id).mem.dirObject = File.at(dir)
        Task.id(id).mem.var.dirname = activeObj.name
        Task.id(id).pocket = []

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
        task.window.node.children[0].children[0].children[1].innerHTML = activeObj.name
        task.window.node.children[0].children[0].children[0].setAttribute("style", `background-image: url('${activeObj.cfg.icon.image}')`)

        mem.createExplorerIcons(dirPlex).then( e => mem.createExplorerIcons(dirFolder).then(e => mem.createExplorerIcons(dirFile)))
        
    } catch (e) {
        mem.var.error = e
        mem.var.errorB = [["Okay"]]
        runLauncher("/plexos/app/sys/Popup/popup.lau.js",
            {
             name:"Error",
             type:false,
             title:"Directory not found",
             description:"This directory seems to no longer exist. It might have been deleted, moved, or a parent directory been renamed",
             taskid:task.id,
             icon:""
            }
        )

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
    let editFile = null
    let editFrom = mem.dirObject
    let editAddr = mem.address

    //--------------------------------------------------------------|

    let iconArray = mem.iconArray

    let typeDefaults = File.typeDefaults(Type)

    function createExplorerFile(name) {
		if(File.nameAvailable(name, null, editFrom)) {
            let newFileIcon = new Icon (
                {
                    image : typeDefaults.iconImag,
					name : name,
					class : typeDefaults.confType,
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
    createdIcon.rename()
}