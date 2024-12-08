import Task from "/plexos/lib/classes/system/task.js"
import File from "/plexos/lib/classes/files/file.js"
import ContextMenu from "/plexos/lib/classes/interface/contextmenu.js"
import Icon from "/plexos/lib/classes/interface/icon.js"

let task = Task.id("TASKID")
let mem  = task.mem
task.apps = "exp"
mem.var = {}
mem.iconArray = []
mem.dirObject = {}
mem.address = "xcorex"

//IconDir class
class IconDir {
    constructor(p){
        this.stat = 0
        this.file = p.file
        this.imag = p.imag
        this.name = p.name
        this.exte = p.exte
        this.task = p.task

        this.drop = []
    }
    createNode(){
        //Icon HTML structure-----|
        let newIcon = document.createElement("div")
        newIcon.setAttribute("class", "explorerIcon ID_"+this.task)
        newIcon.setAttribute("title", this.name)

        let newIconImage = document.createElement("div")
        newIconImage.setAttribute("class", "explorerIconImage ID_"+this.task)
        newIconImage.setAttribute("style", "background-image: url('"+this.imag+"');")
        newIcon.appendChild(newIconImage)

        let newIconText = document.createElement("span")
        newIconText.setAttribute("class", "explorerIconText ID_"+this.task)
        let newIconTextNode = document.createTextNode(this.name)
        newIconText.appendChild(newIconTextNode)
        newIcon.appendChild(newIconText)

        task.node.getElementsByClassName("list")[0].appendChild(newIcon)
        //------------------------|

        this.node = newIcon
    
        this.statNode()
        this.clic()
    }
    deleteNode(){
        this.node.parentNode.removeChild(this.node)
    
        Task.id(this.task).pocket = Task.id(this.task).pocket.remove(this)
        Task.id(this.task).mem.iconArray = Task.id(this.task).mem.iconArray.remove(this)
        
        if (File.at(File.at(this.file)?.cfg.parent) === plexos.vtx && Task.get("Desktop")) { //delete desktop icon if file is from vertex
            let icon = Task.get("Desktop").mem.getIcon(File.at(this.file).cfg.icon.name)
            icon.deleteNode()
        }
    }
    statNode(num){
        //0 => unselected | 1 => selected | 2 => moving
        this.stat = (num != undefined) ? num : this.stat

        switch(this.stat){
            case 0:
                this.node.classList.remove("active")
                this.node.classList.remove("moving")
                break
            case 1:
                this.node.classList.remove("moving")
                if(!this.node.classList.contains("active")) this.node.className += " active"
                if(!Task.id(this.task).pocket.includes(this)) Task.id(this.task).pocket.push(this)
                break
            case 2: 
                if(!this.node.classList.contains("moving")) this.node.className += " moving"
                break
            default: 
        }
    }
    drag(e){
        dragMouseDown(e, this.node, this)

        function dragMouseDown(e, node, _this) {
            e = e || window.event
            e.preventDefault()
            
            //when mousedown on selected icon
            if (_this.stat === 1) {
                //managing selected icons
                for (let icon of Task.id(_this.task).pocket) {
                    //light up all hover border onmousedown:-|
                    icon.highlight(true)
                    //---------------------------------------|
                }
            } else {
                if (system.mem.var.shSelect == true && !system.mem.var.dragging) {
                    //light up 1 hover border onmousedown:
                    _this.highlight(true)
                    
                    //when mousedown on unselected icon
                    if(!e.ctrlKey) {
                        for (let icon of Task.id(_this.task).pocket){
                            Task.id(_this.task).pocket = Task.id(_this.task).pocket.remove(icon)
                            icon.statNode(0)
                            icon.highlight(false)
                        }
                        Task.id(_this.task).pocket.push(_this)
                        _this.statNode(1)
                        _this.highlight(true)
                    } else if(e.ctrlKey) {
                        Task.id(_this.task).pocket.push(_this)
                        _this.statNode(1)
                        _this.highlight(true)
                    }
                }
            }
    
            document.onmousemove = e => dragMouseMove(e, node)
            document.onmouseup   = e => dragMouseEnd(e, node)
    
            function dragMouseMove(e, node) {
                e.preventDefault()

                for (let icon of Task.id(_this.task).pocket){
                    icon.statNode(2)
                }

                if (document.getElementById("dragLayer").children.length === 0) {
                    //make pocket representation on dragLayer--------||
                    let pockImg = (Task.id(_this.task).pocket.length > 3) ? 3 : Task.id(_this.task).pocket.length
    
                    let iconShip = document.createElement("div")
                    iconShip.setAttribute("class", "iconShip")

                    let iconShipImg = document.createElement("div")
                    iconShipImg.setAttribute("class", "iconShipImg")
                    if (pockImg === 1) {
                        iconShipImg.setAttribute("style", "background-image: url('"+_this.imag+"'); background-size: 68%;")
                    } else {
                        iconShipImg.setAttribute("style", "background-image: url('/plexos/res/images/svg/miscUI/pocket_ship_"+pockImg+".svg')")
                    }
    
                    let iconShipSize = document.createElement("div")
                    iconShipSize.setAttribute("class", "iconShipSize")
                    iconShipSize.innerHTML = "<span>" + Task.id(_this.task).pocket.length + "</span>"
    
                    iconShip.appendChild(iconShipSize)
                    iconShip.appendChild(iconShipImg)
                    document.getElementById("dragLayer").appendChild(iconShip)
                    //----------------------------------------------||
                } else {
                    let iconShip = document.getElementById("dragLayer").children[0]

                    iconShip.style.top  = e.clientY - iconShip.offsetHeight/2 + "px"
                    iconShip.style.left = e.clientX - iconShip.offsetWidth/2  + "px"
                }
                system.mem.var.dragging = true
            }
    
            function dragMouseEnd(e, node) {
                e.preventDefault()
                document.onmousemove = null
                document.onmouseup   = null

                //empty dragLayer
                document.getElementById("dragLayer").innerHTML = ""
    
                //unselect other folders on mouseup W/O drag UNLESS ctrl
                if(e.ctrlKey == false && system.mem.var.dragging == false && e.button == 0) {
                    for (let icon of Task.id(_this.task).pocket){
                        Task.id(_this.task).pocket = Task.id(_this.task).pocket.remove(icon)
                        icon.statNode(0)
                        icon.highlight(false)
                    }
                    _this.statNode(1)
                } else {
                    for (let icon of Task.id(_this.task).pocket){
                        icon.statNode(1)
                        icon.highlight(false)
                    }
                }
                system.mem.var.dragging = false
            }
        }
    }
    clic(){
        this.node.onmousedown = e => this.drag(e)
        this.node.oncontextmenu = e => ContextMenu.open(e,this)
        this.node.ondblclick = e => this.open()
    }
    open(){
        if (this.exte == "dir") {
            Task.id(this.task).mem.explorerInit(this.file, this.task)
        } else {
            File.at(this.file).open()
        }
    }
    highlight(coin) {
        if (coin) {
            this.node.classList.add("highlight")
            return
        } 
        this.node.classList.remove("highlight")
    }
    rename(e){
        let iconText = this.node.childNodes[1]
        let editFile = File.at(this.file)
        let editFrom = File.at(editFile.cfg.parent)
        let thisIcon = this
        //make h3 editable --------------------|
        iconText.setAttribute("contenteditable", "true")
        iconText.setAttribute("spellcheck", "false")
        
        //select h3 content --------------------|
        let exte = iconText.innerText.match(/\.(?:.(?<!\.))+$/s)
        exte = (exte!=null && exte.length > 0) ? exte[0] : ""
        this.statNode(1)
        this.stat = 0
        dll.selectText(iconText,0, iconText.innerText.replace(exte,"").length)
    
        iconText.style.textShadow = "none"
        iconText.style.display = "block"
    
        //restore -> leave icon unmodified
        document.body.oncontextmenu = iconRenamingRestore
        window.onkeydown = (e) => {if(e.key == "Escape"){
            iconRenamingRestore()
            return false
        }}
        function iconRenamingRestore(){
            system.mem.var.shSelect = true
            
            thisIcon.statNode()
    
            iconText.textContent = thisIcon.name
            iconText.setAttribute("contenteditable", "false");
            iconText.style.backgroundColor = ""
            iconText.style.textShadow = ""
    
            iconText.blur();
            dll.clearSelection();
    
            dll.nullifyOnEvents(iconText)
        }
    
        setTimeout( () => {
        document.body.onmousedown = iconRenaming
        iconText.onkeydown = (e) => {
            if(e.key == "Enter" && e.shiftKey == false){
                iconRenaming()
                return false
            }
        }
        function iconRenaming(){
            if(
                !File.nameAvailable(iconText.textContent, editFile.cfg.icon, editFrom) &&
                File.validName(iconText.textContent)
            ) {
                //if the name is allowed --------------------|
                system.mem.var.shSelect = true;
    
                if (editFrom === plexos.vtx) thisIcon.node.id = "Icon: "+iconText.textContent
                
                iconText.setAttribute("contenteditable", "false")
                editFile.cfg.icon.name = iconText.textContent
                thisIcon.node.setAttribute("title", iconText.textContent)
                iconText.style.backgroundColor = ""
                iconText.style.textShadow = ""
    
                //insert into fylesystem
                if (iconText.textContent != editFile.name) { //if the name changed
                    if (editFrom === plexos.vtx){
                        Task.get("Desktop").mem.getIcon(editFile.name).file = editFrom.cfg.addr +"/"+ iconText.textContent
                        Task.get("Desktop").mem.getIcon(editFile.name).name = iconText.textContent
                    }
                    editFile.rename(iconText.textContent)
                    if (thisIcon.task) {
                        let taskid = thisIcon.task
                        task   = Task.id(taskid)
                        task.mem.iconArray = task.mem.iconArray.remove(thisIcon)
                        task.node.getElementsByClassName("list")[0].removeChild(thisIcon.node)
    
                        editFile.render(taskid)
                        thisIcon = task.mem.iconArray[task.mem.iconArray.length-1]
    
                        for (icon of task.mem.iconArray) {
                            if (icon.name == iconText.textContent) {
                                icon.statNode(1)
                                task.pocket.push(icon)
                            }
                        }
                    }
                }
    
                thisIcon.statNode(0)
                iconText.blur()
                dll.clearSelection()
    
                dll.nullifyOnEvents(iconText)
            } else {
                //if the name not allowed --------------------|
                system.mem.var.shSelect = false
                iconText.style.backgroundColor = "#c90000"
    
                //insist -> keep only edited selected
                document.body.onclick = iconRenamingInsist
                window.onkeyup = (e) => {
                    if(e.key == "Enter"){
                        iconRenamingInsist()
                        return false
                    }
                }
                function iconRenamingInsist(){
                    if (thisIcon.task) {
                        for (let icon of Task.id(thisIcon.task).mem.iconArray){
                            icon.statNode(0)
                            Task.id(thisIcon.task).pocket = Task.id(thisIcon.task).pocket.remove(icon)
                        }
                    } else {
                        for (let icon of Task.get("Desktop")?.mem.iconArr){
                            icon.statNode(0)
                            Task.get("Desktop").pocket = Task.get("Desktop").pocket.remove(icon)
                        }
                    }
                    thisIcon.statNode(1)
                    thisIcon.stat = 0
    
                    dll.selectText(iconText)
                }
            }
        }
        }, 0) //TIMEOUT
    }
}

//local functions
mem.createExplorerIcons = async function(array) {
    for(let item of array) {
        let itemIcon = item.cfg.icon
        let dirIcon  = new IconDir(
            {           
                imag : itemIcon.imag,
                name : itemIcon.name,
                task : "TASKID",
                exte : itemIcon.exte,
                file : itemIcon.file
            }
        )
        mem.iconArray.push(dirIcon)
        
        dirIcon.createNode()
    }
}
mem.refresh = function () {
    mem.explorerInit(mem.dirObject.cfg.addr, "TASKID", "refresh")
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
            if(item[1].cfg.type === "Directory" && !item[1].cfg.system) {
                dirFolder.push(item[1])
            }
        }
        for (let item of dirList) {
            if(item[1].cfg.type !=  "Directory") {
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
        task.window.node.children[0].children[0].children[0].setAttribute("style", `background-image: url('${activeObj.cfg.icon.imag}')`)

        mem.createExplorerIcons(dirPlex).then( e => mem.createExplorerIcons(dirFolder).then(e => mem.createExplorerIcons(dirFile)))
        
    } catch (e) {
        console.error(e)
        mem.var.error = e
        mem.var.errorB = [["Okay"]]
        dll.runLauncher("/plexos/app/sys/Popup/popup_lau.js",
            {
             name:"Error",
             type:false,
             title:"Couldn't load directory",
             description:"This directory seems to no longer exist. It might have been deleted, moved, or a parent directory been renamed",
             taskid:"TASKID",
             icon:""
            }
        )

        if (act === "refresh") mem.explorerInit("", "TASKID")
    }
}

mem.explorerInit("xcorex", "TASKID")

//nav buttons ---------------|

//history back [<]
task.node.getElementsByClassName("back")[0].onclick = e => {

}
//parent dir
task.node.getElementsByClassName("parent")[0].onclick = e => {
    if (mem.address !== "") {
        try {
            mem.explorerInit(mem.dirObject.cfg.parent, "TASKID")
        } catch (e1) {
            try {
                let newDir = mem.address.replace(/\/(?:.(?!\/))+$/gim, "")
                mem.explorerInit(newDir, "TASKID")
            } catch (e) {
                mem.var.error  = e
                mem.var.errorB = [["Okay"]]
                dll.runLauncher("/plexos/app/sys/Popup/popup_lau.js",
                    {
                     name:"Error",
                     type:false,
                     title:"Couldn't load directory",
                     description:"This directory seems to no longer exist. It might have been deleted, moved, or a parent directory been renamed",
                     taskid:"TASKID",
                     icon:""
                    }
                )

                mem.explorerInit("", "TASKID")
            }
        }
    } else {
        mem.explorerInit(mem.address, "TASKID")
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
        let envfocus = system.mem.var.envfocus

        let menu = [
            {name: "icon", list: [
                {name:"View",icon:"url('plexos/res/images/svg/contextMenu/grid.svg')",func:envfocus.mem.refresh},
                {name:"Refresh",icon:"url('plexos/res/images/svg/contextMenu/refresh.svg')",func:envfocus.mem.refresh},
            ]},
            {name: "file", list: [
                {name:"New",icon:"url('plexos/res/images/svg/contextMenu/new2.svg')",func: [
                    {name: "new", list: [
                        {name:"Directory",icon:"url('plexos/res/images/svg/contextMenu/directory.svg')",func:() => envfocus.mem.new(e,task,"Directory","New Folder")},
                        {name:"Metafile",icon:"url('plexos/res/images/svg/contextMenu/metafile.svg')",func:() => envfocus.mem.new(e,task,"Metafile","New Metafile.msf")},
                        {name:"Text Document",icon:"url('plexos/res/images/svg/contextMenu/textfile.svg')",func:() => envfocus.mem.new(e,task,"JsString","New Text Document.txt")},
                    ]}
                ]},
                {name:"Paste",icon:"url('plexos/res/images/svg/contextMenu/paste.svg')",func: () => {return} },
            ]},
            {name: "info", list: [
                {name:"About",icon:"url('plexos/res/images/svg/contextMenu/about.svg')",func: () => {return} },
                {name:"Properties",icon:"url('plexos/res/images/svg/contextMenu/properties.svg')",func: () => {return} }
            ]}
        ]
        ContextMenu.open(e, task, menu)
    }
}

mem.new = function(e, _this, Type, name){
    if((e.target.classList.contains("cmcheck"))) return
    
    let editFile = null
    let editFrom = mem.dirObject
    let editAddr = mem.address

    //--------------------------------------------------------------|

    let iconArray = mem.iconArray

    let typeDefaults = File.typeDefaults(Type)

    function createExplorerFile(name) {
		if(!File.nameAvailable(name, null, editFrom)) {
            let newFileIcon = new Icon (
                {
                    imag : typeDefaults.iconImag,
					name : name,
					type : typeDefaults.confType,
					stat : 0
				}
            )
			editFrom.new(Type,name,newFileIcon)
            editFrom.dir[name].render("TASKID")
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