import plexos from "/boot/plexos.js"
import {getTask, imposeValues, runLauncher} from "/plexos/lib/functions/dll.js"
import File from "/plexos/lib/classes/filesystem/file.js"
import Task from "/plexos/lib/classes/system/task.js"
import Icon from "/plexos/lib/classes/interface/icon.js"
import ContextMenu from "/plexos/lib/classes/interface/contextmenu.js"

let task = getTask(/TASKID/)
let mem  = task.mem
let arg  = mem.arg
let cfg  = mem.cfg

mem.iconArr = []
mem.dirObject = {}

//desktop methods
mem.createDesktopIcons = async function(array) {
	let iconsToCreate = []
    for(let item of array) {
		if (mem.getIcon(item.cfg.path)) {
			mem.getIcon(item.cfg.path).render()
		} else {
			let deskIcon = new mem.class.IconDesk(item.cfg.icon)
			deskIcon.createNode()
			iconsToCreate.push(deskIcon)
		}
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
		mem.address = arg.address
		mem.dirObject   = File.at(arg.address)
		mem.var.dirname = File.at(arg.address).name
		mem.var.hiddenIcons = 0
        task.pocket = []

        let itemList = []
        let dirList = Object.entries(mem.dirObject.dir)
        for (let item of dirList) itemList.push(item[1])
			
		//if the grid is too small to fit initial amount of icons, find optimal size	
		if (!mem.checkIfGridCanFit(itemList)) mem.initialGridDrawingSquared(itemList)
        else mem.initialGridDrawingProcedual(itemList)
    } catch (e) {
		task.popup(e,[["OK"]],{
			name:"Error",
			type:false,
			title:"Directory not found",
			description:"This directory seems to no longer exist. It might have been deleted, moved, or a parent directory been renamed",
			taskid:task.id,
			icon:""
		})
    }
}

mem.initialGridDrawingProcedual = function(itemList) {
	let initialAutoHl = cfg.grid.autoHlength
	let initialAutoVl = cfg.grid.autoVlength
	let initialAutoHm = cfg.grid.autoHlength
	let initialAutoVm = cfg.grid.autoVlength
	cfg.grid.autoHlength = false
	cfg.grid.autoVlength = false
	cfg.grid.autoHmargin = false
	cfg.grid.autoVmargin = false

	mem.grid.evaluateIconGrid(0)
	mem.createDesktopIcons(itemList)

 	cfg.grid.autoHlength = initialAutoHl
	cfg.grid.autoVlength = initialAutoVl
	cfg.grid.autoHmargin = initialAutoHm
	cfg.grid.autoVmargin = initialAutoVm

	mem.grid.evaluateIconGrid(3)
}
mem.initialGridDrawingSquared = function(itemList) {
	//if the grid is too small to fit initial amount of icons, find optimal size
	let initialAutoH = cfg.grid.autoHlength
	let initialAutoV = cfg.grid.autoVlength
	cfg.grid.hLength = Math.ceil (Math.sqrt(itemList.length))
	cfg.grid.vLength = Math.round(Math.sqrt(itemList.length))
	cfg.grid.autoHlength = false
	cfg.grid.autoVlength = false
	mem.grid.evaluateIconGrid(3)
	mem.createDesktopIcons(itemList)
	cfg.grid.autoHlength = initialAutoH
	cfg.grid.autoVlength = initialAutoV
	mem.grid.evaluateIconGrid(3)
}
mem.checkIfGridCanFit = function(itemList) {
	let w      = cfg.grid.width 
    let h      = cfg.grid.height
    let wm     = cfg.grid.hMargin
    let hm     = cfg.grid.vMargin
    let windowW = task.node.offsetWidth
    let windowH = task.node.offsetHeight

    //set margin to modified margins if set without auto
    if (cfg.grid.modHmargin && !cfg.grid.autoHmargin) wm = cfg.grid.modHmargin
    if (cfg.grid.modVmargin && !cfg.grid.autoVmargin) hm = cfg.grid.modVmargin
    
    //evaluate optimal grid length if enabled
    let gridHorizontal = Math.round((windowW-(w+wm*3)/2)/(w+wm))
    let gridVertical = Math.round((windowH-(h+hm*3)/2)/(h+hm))

	return gridHorizontal*gridVertical >= itemList.length
}

mem.renderIcons = function() {
	for (let file of Object.entries(mem.dirObject.dir)) {
		file[1].render()
	}
}

mem.getIcon = function(path){
    let find = mem.iconArr.filter(icon => icon.file === path)
    return ((find.length>0) ? find[0] : null)
}

mem.filterIconListJson = function () {
	let iconFilter = {
		state : undefined,
        image : undefined,
        class : undefined,
		node  : undefined,
        exte  : undefined,
		drop  : undefined,
		keyNodes : undefined,
	}

	let coorFilter = {
		tx:undefined,
		ty:undefined
	}

	let filteredIconList = mem.iconArr.map(icon=>imposeValues({...icon},iconFilter))
		filteredIconList.forEach(icon=> icon.coords = imposeValues({...icon.coords},coorFilter))

	return filteredIconList
}

// Where an icon of this desktop sits, for the bin to remember: its cell with the grid on, its pixels with it off.
// Restoring with the grid on goes back to that cell, or the next free one. Gridless placement isn't built yet;
// when it is, the pixels come back too, clamped to the border when sticky is on, else the desktop scrolls
mem.placeOf = function (path) {
	const icon = mem.getIcon(path)
	if (!icon?.coords) return null
	return cfg.grid.enabled
		? { grid: true, ax: icon.coords.ax, ay: icon.coords.ay }
		: { grid: false, px: icon.coords.px, py: icon.coords.py }
}

//Delete sends the selection to the bin
mem.deleteSelectedNodes = function(){
	Task.recycleIcons(Task.unlockedIcons(task.pocket, task), task)
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

	task.cmd("event.emit", { eventName: "desktop-refresh" })
}

//after a transfer into the desktop, select what arrived. It never refreshes for one: each move already took
//the icon off the source and placed it here
mem.selectArrivals = function (to, moved) {
	if (mem.dirObject?.cfg?.path !== to) return
	for (const icon of [...task.pocket]) {
		task.pocket = task.pocket.remove(icon)
		icon.statNode(0)
	}
	for (const path of moved) mem.getIcon(path)?.statNode(1)
}

mem.new = async function(Type, name){
	//Make sure icon appears at center of initial right click-------|
	let contextMenu = ContextMenu.node
	let initialX = (contextMenu) ? parseInt(window.getComputedStyle(contextMenu,null).getPropertyValue("left")) : 0
	let initialY = (contextMenu) ? parseInt(window.getComputedStyle(contextMenu,null).getPropertyValue("top"))  : 0

	let editFrom = mem.dirObject
	let path = editFrom.cfg.path

	let iconWidth = cfg.grid.width/2
	let iconHeight = cfg.grid.height/2

	let w = cfg.grid.width; let h = cfg.grid.height; let wm = cfg.grid.hMargin; let hm = cfg.grid.vMargin

	let iconPosX = (Math.round((initialX-iconWidth)/(w + wm))*(w + wm) + wm)
	let iconPosY = (Math.round((initialY-iconHeight)/(h + hm))*(h + hm) + hm)
	//--------------------------------------------------------------|
	let classDefaults = File.classDefaults(Type)

	async function createDesktopFile(name) {
		name = File.returnAvailableName(name, null, editFrom)
			let newFileIcon = new Icon (
				{
					name : name,
					class : classDefaults.confType,
					state : 0
				}
			)
			let newFile = await task.cmd("file.create", {path, Type, name, newFileIcon})
			console.log(newFile)
            let newDesktopIcon = new mem.class.IconDesk(newFile.cfg.icon)
			newDesktopIcon.coords = {
				px : iconPosX,
				py : iconPosY,
				tx : iconPosX,
				ty : iconPosY,
				ax : null,
				ay : null,
			} 
			newDesktopIcon.createNode()
			mem.repositionIcons([newDesktopIcon],true)
			if (newDesktopIcon.node) {
				newDesktopIcon.poseNode()
				newDesktopIcon.statNode()
			}
			return newDesktopIcon
	}

	let newIcon = await createDesktopFile(name)
	newIcon.editName()
	return File.at(newIcon.file)
}