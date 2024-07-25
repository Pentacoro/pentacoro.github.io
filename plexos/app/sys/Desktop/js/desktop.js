let task = Task.id("TASKID")
let mem  = task.mem
mem.var = {}
mem.iconArr = []
mem.dirObject = {}
mem.address = "xcorex"

window.addEventListener("resize", e => {
	task.node.style.width = document.body.offsetWidth + "px"
    task.node.style.height = document.body.offsetHeight - cfg.desktop.taskbar.height + "px"
})

//set background size
task.node.style.width = document.body.offsetWidth + "px"
task.node.style.height = document.body.offsetHeight - cfg.desktop.taskbar.height + "px"

//desktop methods
mem.createDesktopIcons = async function(array) {
    for(let item of array) {
        deskIcon = new mem.class.IconDesk(item.cfg.icon)
        deskIcon.createNode()
    }
}
mem.desktopInit = function (dir, id, act = null) {    
    try {       
        let activeObj = File.at(dir)
        let dirList   = Object.entries(activeObj.dir)

        for (let icon of Task.id(id).mem.iconArr){
            document.getElementsByClassName("list ID_"+id)[0].removeChild(icon.node)
        }

        Task.id(id).mem.iconArr = []
        Task.id(id).mem.address = dir
        Task.id(id).mem.dirObject = File.at(dir)
        Task.id(id).mem.var.dirname = activeObj.name
        Task.id(id).pocket = []

        let itemList = []
        for (let item of dirList) itemList.push(item[1])

        mem.grid.evaluateIconGrid()
        mem.createDesktopIcons(itemList)
        
    } catch (e) {
        mem.var.error = e
        mem.var.errorB = [["Okay"]]
        console.log(e)
        dll.runLauncher("/plexos/app/sys/Popup/popup_lau.js",
            {
             name:"Error",
             type:false,
             title:"Couldn't load directory",
             description:"This directory seems to no longer exist. It might have been moved, or a parent directory been renamed",
             taskid:"TASKID",
             icon:""
            }
        )

        if (act === "refresh") mem.desktopInit("", "TASKID")
    }
}

mem.renderIcons = function() {
	for (file of Object.entries(plexos.vtx.dir)) {
		file[1].render()
	}
}

mem.getIcon = function(name){
    let find = mem.iconArr.filter(icon => icon.name === name)
    return find[0]
}

mem.refresh = function() {
    task.pocket = []

	for (icon of mem.iconArr) {
		icon.deleteNode()
	}
    document.getElementById("iconLayer").innerHTML = ""
	for (file of Object.entries(plexos.vtx.dir)) {
		file[1].render()
	}
}
task.node.onfocus = e => {
	for (icon of mem.iconArr) {
		icon.gray(false)
	}
}
task.node.onblur = e => {
	for (icon of mem.iconArr) {
		icon.gray(true)
	}
}

mem.new = function(e, _this, Type, name){
	//Make sure icon appears at center of initial right click-------|
	let initialX = parseInt(window.getComputedStyle(document.getElementsByClassName("clickContext sub_0")[0],null).getPropertyValue("left"))
	let initialY = parseInt(window.getComputedStyle(document.getElementsByClassName("clickContext sub_0")[0],null).getPropertyValue("top"))

	let editFile = null
	let editFrom = plexos.vtx

	let iconWidth = cfg.desktop.grid.width/2
	let iconHeight = cfg.desktop.grid.height/2

	let w = cfg.desktop.grid.width; let h = cfg.desktop.grid.height; let wm = cfg.desktop.grid.hMargin; let hm = cfg.desktop.grid.vMargin

	let iconPosX = (Math.round((initialX-iconWidth)/(w + wm))*(w + wm) + wm)
	let iconPosY = (Math.round((initialY-iconHeight)/(h + hm))*(h + hm) + hm)
	//--------------------------------------------------------------|
	let typeDefaults = File.typeDefaults(Type)

	function createDesktopFile(name) {
		if(!File.nameAvailable(name, null, editFrom)) {
			let newFileIcon = new Icon (
				{
					imag : typeDefaults.iconImag,
					name : name,
					type : typeDefaults.confType,
					stat : 0,
					coor : {
						px : iconPosX,
						py : iconPosY,
						tx : iconPosX,
						ty : iconPosY,
						ax : null,
						ay : null,
					} 
				}
			)
			let newFile = editFrom.new(Type,name,newFileIcon)
            let newDesktopIcon = new mem.class.IconDesk(newFile.cfg.icon)
			newDesktopIcon.createNode()

			return newDesktopIcon
		} else {
			let exte = name.match(/\.(?:.(?<!\.))+$/s)
			exte = (exte!=null && exte.length > 0) ? exte[0] : ""
			name = name.replace(exte,"")
			let amnt = name.match(/(?<!\w)\d+$/)
			amnt = (amnt!=null && amnt.length > 0) ? parseInt(amnt[0],10) : ""
			let dgts = (amnt!="") ? (""+amnt).length : 1
			name = (amnt!="") ? name.slice(0,(name.length)-dgts) + (amnt+1) : name + " 2"
			name = name + exte
			return createDesktopFile(name)
		}
	}

	createDesktopFile(name).rename()
}

mem.desktopInit("xcorex", "TASKID")