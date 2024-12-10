import {plexos, cfg} from "/plexos/ini/system.js"
import {getTask, runLauncher} from "/plexos/lib/functions/dll.js"
import File from "/plexos/lib/classes/files/file.js"
import Icon from "/plexos/lib/classes/interface/icon.js"

let task = getTask(/TASKID/)
let mem  = task.mem
let arg  = mem.arg

mem.iconArr = []
mem.dirObject = {}

//desktop methods
mem.createDesktopIcons = async function(array) {
	let iconsToCreate = []
    for(let item of array) {
		let deskIcon = new mem.class.IconDesk(item.cfg.icon)
		deskIcon.createNode()
		iconsToCreate.push(deskIcon)
    }
	let validatedIcons = mem.repositionIcons(iconsToCreate,true)
	for (let icon of validatedIcons) {
		icon.poseNode()
		icon.statNode()
	}
}
mem.desktopInit = function (dir) {    
    try {       
        mem.iconArr = []
        arg.address = dir
        mem.dirObject   = File.at(dir)
        mem.var.dirname = File.at(dir).name
		mem.var.hiddenIcons = 0
        task.pocket = []

        let itemList = []
        let dirList = Object.entries(mem.dirObject.dir)
        for (let item of dirList) itemList.push(item[1])
			
		//if the grid is too small to fit initial amount of icons, find optimal size	
		if (!mem.checkIfGridCanFit(itemList)) mem.initialGridDrawingSquared(itemList)
        else mem.initialGridDrawingProcedual(itemList)
    } catch (e) {
        mem.var.error = e
        mem.var.errorB = [["Okay"]]
        console.log(e)
        runLauncher("/plexos/app/sys/Popup/popup_lau.js",
            {
             name:"Error",
             type:false,
             title:"Couldn't load directory",
             description:"This directory seems to no longer exist. It might have been deleted, moved, or a parent directory been renamed",
             taskid:task.id,
             icon:""
            }
        )
    }
}

mem.initialGridDrawingProcedual = function(itemList) {
	let initialAutoHl = cfg.desktop.grid.autoHlength
	let initialAutoVl = cfg.desktop.grid.autoVlength
	let initialAutoHm = cfg.desktop.grid.autoHlength
	let initialAutoVm = cfg.desktop.grid.autoVlength
	cfg.desktop.grid.autoHlength = false
	cfg.desktop.grid.autoVlength = false
	cfg.desktop.grid.autoHmargin = false
	cfg.desktop.grid.autoVmargin = false

	mem.grid.evaluateIconGrid(0)
	mem.createDesktopIcons(itemList)

 	cfg.desktop.grid.autoHlength = initialAutoHl
	cfg.desktop.grid.autoVlength = initialAutoVl
	cfg.desktop.grid.autoHmargin = initialAutoHm
	cfg.desktop.grid.autoVmargin = initialAutoVm

	mem.grid.evaluateIconGrid(3)
}
mem.initialGridDrawingSquared = function(itemList) {
	//if the grid is too small to fit initial amount of icons, find optimal size
	let initialAutoH = cfg.desktop.grid.autoHlength
	let initialAutoV = cfg.desktop.grid.autoVlength
	cfg.desktop.grid.hLength = Math.ceil (Math.sqrt(itemList.length))
	cfg.desktop.grid.vLength = Math.round(Math.sqrt(itemList.length))
	cfg.desktop.grid.autoHlength = false
	cfg.desktop.grid.autoVlength = false
	mem.grid.evaluateIconGrid(3)
	mem.createDesktopIcons(itemList)
	cfg.desktop.grid.autoHlength = initialAutoH
	cfg.desktop.grid.autoVlength = initialAutoV
	mem.grid.evaluateIconGrid(3)
}
mem.checkIfGridCanFit = function(itemList) {
	let w      = cfg.desktop.grid.width 
    let h      = cfg.desktop.grid.height
    let wm     = cfg.desktop.grid.hMargin
    let hm     = cfg.desktop.grid.vMargin
    let windowW = task.node.offsetWidth
    let windowH = task.node.offsetHeight

    //set margin to modified margins if set without auto
    if (cfg.desktop.grid.modHmargin && !cfg.desktop.grid.autoHmargin) wm = cfg.desktop.grid.modHmargin
    if (cfg.desktop.grid.modVmargin && !cfg.desktop.grid.autoVmargin) hm = cfg.desktop.grid.modVmargin
    
    //evaluate optimal grid length if enabled
    let gridHorizontal = Math.round((windowW-(w+wm*3)/2)/(w+wm))
    let gridVertical = Math.round((windowH-(h+hm*3)/2)/(h+hm))

	return gridHorizontal*gridVertical >= itemList.length
}

mem.renderIcons = function() {
	for (let file of Object.entries(plexos.vtx.dir)) {
		file[1].render()
	}
}

mem.getIcon = function(name){
    let find = mem.iconArr.filter(icon => icon.name === name)
    return find[0]
}

mem.refresh = function() {
    task.pocket = []
	mem.var.hiddenIcons = 0

	for (let icon of mem.iconArr) {
		if (icon.node) icon.deleteNode()
	}

	let itemList = []
	let dirList = Object.entries(mem.dirObject.dir)
	for (let item of dirList) itemList.push(item[1])
	mem.createDesktopIcons(itemList)

	task.emit("desktop-refresh")
}
task.focus = e => {
	for (let icon of mem.iconArr) {
		icon.focus()
	}
}
task.blur = e => {
	for (let icon of mem.iconArr) {
		icon.blur()
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
			mem.repositionIcons([newDesktopIcon],true)
			if (newDesktopIcon.node) {
				newDesktopIcon.poseNode()
				newDesktopIcon.statNode()
			}
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