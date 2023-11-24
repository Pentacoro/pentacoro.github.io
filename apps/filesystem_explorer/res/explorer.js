let task = system.mem.task("TASKID")
let mem  = task.mem
task.apps = "exp"
mem.var = {}
mem.iconArray = []
mem.dirObject = {}
mem.directory = "xcorex"

//IconDir class
class IconDir {
    constructor(p){
        this.stat = 0
        this.file = p.file
        this.imag = p.imag
        this.text = p.text
        this.apps = p.apps
        this.task = p.task

        this.drop = []
    }
    createNode(){
        //Icon HTML structure-----|
        let newIcon = document.createElement("div")
        newIcon.setAttribute("class", "explorerIcon ID_"+this.task)

        let newIconImage = document.createElement("div")
        newIconImage.setAttribute("class", "explorerIconImage ID_"+this.task)
        newIconImage.setAttribute("style", "background-image: url('"+this.imag+"');")
        newIcon.appendChild(newIconImage)

        let newIconText = document.createElement("span")
        newIconText.setAttribute("class", "explorerIconText ID_"+this.task)
        let newIconTextNode = document.createTextNode(this.text)
        newIconText.appendChild(newIconTextNode)
        newIcon.appendChild(newIconText)

        document.getElementsByClassName("list ID_"+this.task)[0].appendChild(newIcon)
        //------------------------|

        this.node = newIcon
    
        this.statNode()
        this.clic()
    }
    deleteNode(){
        this.node.parentNode.removeChild(this.node)
    
        system.mem.task(this.task).pocket = system.mem.task(this.task).pocket.remove(this)
        system.mem.task(this.task).mem.iconArray = system.mem.task(this.task).mem.iconArray.remove(this)
    
        if (at(at(this.file).conf.from) === sys.vertex) { //delete desktop icon if file is from vertex
            let rawr = at(this.file).conf.icon
            rawr.deleteNode()
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
                for (icon of system.mem.task(_this.task).pocket) {
                    //light up all hover border onmousedown:-|
                    highlight(icon.node)
                    //---------------------------------------|
                }
            } else {
                if (system.mem.var.shSelect == true && !system.mem.var.dragging) {
                    //light up 1 hover border onmousedown:
                    highlight(node)
                    
                    //when mousedown on unselected icon
                    if(!keyPressCtrl) {
                        for (icon of system.mem.task(_this.task).pocket){
                            system.mem.task(_this.task).pocket = system.mem.task(_this.task).pocket.remove(icon)
                            icon.statNode(0)
                            lowlight(icon.node)
                        }
                        system.mem.task(_this.task).pocket.push(_this)
                        _this.statNode(1)
                        highlight(node)
                    } else if(keyPressCtrl) {
                        system.mem.task(_this.task).pocket.push(_this)
                        _this.statNode(1)
                        highlight(node)
                    }
                }
            }
    
            document.onmousemove = e => dragMouseMove(e, node)
            document.onmouseup   = e => dragMouseEnd(e, node)
    
            function dragMouseMove(e, node) {
                e.preventDefault()

                for (icon of system.mem.task(_this.task).pocket){
                    icon.statNode(2)
                }

                if (document.getElementById("godGrasp").children.length === 0) {
                    //make pocket representation on godGrasp--------||
                    let pockImg = (system.mem.task(_this.task).pocket.length > 3) ? 3 : system.mem.task(_this.task).pocket.length
    
                    let iconShip = document.createElement("div")
                    iconShip.setAttribute("class", "iconShip")

                    let iconShipImg = document.createElement("div")
                    iconShipImg.setAttribute("class", "iconShipImg")
                    if (pockImg === 1) {
                        iconShipImg.setAttribute("style", "background-image: url('"+_this.imag+"'); background-size: 68%;")
                    } else {
                        iconShipImg.setAttribute("style", "background-image: url('/assets/svg/miscUI/pocket_ship_"+pockImg+".svg')")
                    }
    
                    let iconShipSize = document.createElement("div")
                    iconShipSize.setAttribute("class", "iconShipSize")
                    iconShipSize.innerHTML = "<span>" + system.mem.task(_this.task).pocket.length + "</span>"
    
                    iconShip.appendChild(iconShipSize)
                    iconShip.appendChild(iconShipImg)
                    document.getElementById("godGrasp").appendChild(iconShip)
                    //----------------------------------------------||
                } else {
                    let iconShip = document.getElementById("godGrasp").children[0]

                    iconShip.style.top  = e.clientY - iconShip.offsetHeight/2 + "px"
                    iconShip.style.left = e.clientX - iconShip.offsetWidth/2  + "px"
                }

    
                system.mem.var.dragging = true
            }
    
            function dragMouseEnd(e, node) {
                e.preventDefault()
                document.onmousemove = null
                document.onmouseup   = null

                //empty godGrasp
                document.getElementById("godGrasp").innerHTML = ""
    
                //unselect other folders on mouseup W/O drag UNLESS ctrl
                if(keyPressCtrl == false && system.mem.var.dragging == false && e.button == 0) {
                    for (icon of system.mem.task(_this.task).pocket){
                        system.mem.task(_this.task).pocket = system.mem.task(_this.task).pocket.remove(icon)
                        icon.statNode(0)
                        lowlight(icon.node)
                    }
                    _this.statNode(1)
                    system.mem.task(_this.task).pocket.push(_this)
                } else {
                    for (icon of system.mem.task(_this.task).pocket){
                        icon.statNode(1)
                        lowlight(icon.node)
                    }
                }
                system.mem.var.dragging = false
            }
        }
    }
    clic(){
        this.node.onmousedown = e => this.drag(e)
        this.node.oncontextmenu = e => openMenu(e,this)
        this.node.ondblclick = e => this.open()
    }
    open(){
        if (this.apps == "dir") {
            system.mem.task(this.task).mem.explorerInit(this.file, this.task)
        } else {
            at(this.file).open()
        }
    }
}

//local functions
mem.createExplorerIcons = async function(array) {
    for(item of array) {
        let itemIcon = item.conf.icon
        let dirIcon  = new IconDir(
            {           
                imag : itemIcon.imag,
                text : itemIcon.text,
                task : "TASKID",
                apps : itemIcon.apps,
                file : itemIcon.file
            }
        )
        mem.iconArray.push(dirIcon)
        
        dirIcon.createNode()
    }
}
mem.refresh = function () {
    mem.explorerInit(mem.dirObject.conf.addr, "TASKID", "refresh")
}
mem.explorerInit = function (dir, id, act = null) {    
    try {       
        let activeObj = at(dir)
        let dirList   = Object.entries(activeObj.cont)

        let dirFolder = []
        let dirFile   = []
        let dirPlex   = []

        for (icon of system.mem.task(id).mem.iconArray){
            document.getElementsByClassName("list ID_"+id)[0].removeChild(icon.node)
        }

        system.mem.task(id).mem.iconArray = []
        system.mem.task(id).mem.directory = dir
        system.mem.task(id).mem.dirObject = at(dir)
        system.mem.task(id).mem.var.dirname = activeObj.name
        system.mem.task(id).pocket = []

        for (item of dirList) {
            if(item[1].conf.type === "dir" && !item[1].conf.plex) {
                dirFolder.push(item[1])
            }
        }
        for (item of dirList) {
            if(item[1].conf.type !=  "dir") {
                dirFile.push(item[1])
            }
        }
        for (item of dirList) {
            if(item[1].conf.plex) {
                dirPlex.push(item[1])
            }
        }

        dirFolder.sort((a, b) => a.name.localeCompare(b.name))
        dirFile.sort  ((a, b) => a.name.localeCompare(b.name))
        dirPlex.sort  ((a, b) => a.name.localeCompare(b.name))

        document.getElementsByClassName("address ID_"+id)[0].innerHTML = dir
        document.getElementsByClassName("window ID_"+id)[0].children[0].children[0].children[0].innerHTML = activeObj.name

        mem.createExplorerIcons(dirPlex).then( e => mem.createExplorerIcons(dirFolder).then(e => mem.createExplorerIcons(dirFile)))
        
    } catch (e) {
        mem.var.error = e
        mem.var.errorB = [["Okay"]]
        loadAPP("./apps/system_popup/popup_lau.js",["Error",false,"Couldn't load directory", "This directory seems to no longer exist. It might have been moved, or a parent directory been renamed","TASKID",""])

        if (act === "refresh") mem.explorerInit("", "TASKID")
    }
}

mem.explorerInit("xcorex", "TASKID")

//nav buttons ---------------|

//history back [<]
document.getElementsByClassName("back ID_TASKID")[0].onclick = e => {

}
//parent dir
document.getElementsByClassName("parent ID_TASKID")[0].onclick = e => {
    if (mem.directory !== "") {
        try {
            mem.explorerInit(mem.dirObject.conf.from, "TASKID")
        } catch (e1) {
            try {
                let newDir = mem.directory.replace(/\/(?:.(?!\/))+$/gim, "")
                mem.explorerInit(newDir, "TASKID")
            } catch (e) {
                mem.var.error  = e
                mem.var.errorB = [["Okay"]]
                loadAPP("./apps/system_popup/popup_lau.js",["Error",false,"Couldn't load directory", "This directory seems to no longer exist. It might have been moved, or a parent directory been renamed","TASKID",""])

                mem.explorerInit("", "TASKID")
            }
        }
    } else {
        mem.explorerInit(mem.directory, "TASKID")
    }
}
//refresh
document.getElementsByClassName("refresh ID_TASKID")[0].onclick = e => {
    mem.refresh()
}

//background click listeners
document.getElementsByClassName("list ID_TASKID")[0].onmousedown = e => {
    if (e.target.classList.contains("list")) {
        for (icon of task.pocket) {
            icon.statNode(0)
            task.pocket = task.pocket.remove(icon)
        }
    }
}
document.getElementsByClassName("list ID_TASKID")[0].oncontextmenu = e => {
    if (e.target.classList.contains("list")) {
        let envfocus = system.mem.var.envfocus

        let menuSections = [
            {name:"icon"},
            {name:"file"},
            {name:"info"}
        ]
        let menuOptions  = [
            {section:"icon", name:"View",icon:"url('assets/svg/contextMenu/grid.svg')",func: () => envfocus.mem.refresh},
            {section:"icon", name:"Refresh",icon:"url('assets/svg/contextMenu/refresh.svg')",func: () => envfocus.mem.refresh},
            {section:"file", name:"New",icon:"url('assets/svg/contextMenu/new2.svg')",func:[
                {name:"Directory",icon:"url('assets/svg/contextMenu/directory.svg')",func:() => envfocus.mem.new(e,task,Directory)},
                {name:"Metafile",icon:"url('assets/svg/contextMenu/metafile.svg')",func:() => envfocus.mem.new(e,task,Metafile)},
                {name:"Text Document",icon:"url('assets/svg/contextMenu/textfile.svg')",func:() => envfocus.mem.new(e,task,Text)},
            ]},
            {section:"file", name:"Paste",icon:"url('assets/svg/contextMenu/paste.svg')",func: () => {return} },
            {section:"info", name:"About",icon:"url('assets/svg/contextMenu/about.svg')",func: () => {return} },
            {section:"info", name:"Properties",icon:"url('assets/svg/contextMenu/properties.svg')",func: () => {return} }
        ]
        openMenu(e, task,menuSections,menuOptions)
    }
}

mem.new = function(e, _this, Type){
    if((e.target.classList.contains("cmcheck"))) return
    
    let editFile = null
    let editFrom = mem.dirObject
    let editAddr = mem.directory

    //--------------------------------------------------------------|

    let iconArray = mem.iconArray

    let typeDefaults = filetypeDefaults(Type)

    iconArray.push(new IconDir (
        {
            imag : typeDefaults.iconImag,
            text : "¡Name me!", 
            task : "TASKID", 
            apps : typeDefaults.confType, 
            file : ""
        }
    ))
    let createdIcon = iconArray[iconArray.length - 1]
    createdIcon.createNode()

    createdIcon.statNode(1)
    createdIcon.stat = 0

    let iconText = createdIcon.node.childNodes[1]
    //make h3 editable --------------------|
    iconText.setAttribute("contenteditable", "true")
    iconText.setAttribute("spellcheck", "false")

    //select h3 content
    selectText(iconText)

    iconText.style.textShadow = "none"

    //delete -> cancel icon creation
    task.wndw.node.addEventListener("dfocus", iconNamingDelete)
    document.body.oncontextmenu = iconNamingDelete
    window.onkeydown = e => {if(e.key == "Escape"){
        iconNamingDelete()
        return false
    }};
    function iconNamingDelete(){
        system.mem.var.shSelect = true
            
        createdIcon.deleteNode()

        nullifyOnEvents(_this)
        task.wndw.node.removeEventListener("dfocus", iconNamingDelete)
    }

    setTimeout( () => { //TIMEOUT

        document.body.onmousedown = iconNaming
        iconText.onkeydown = (e) => {if(e.key == "Enter" && e.shiftKey == false){
            iconNaming()
            return false
        }}

        function iconNaming(){
            if(
                !iconNameExists(iconText.textContent, createdIcon, editFrom) &&
                validIconName(iconText.textContent)
            ) {
                //if the name is allowed --------------------|
                system.mem.var.shSelect = true

                iconText.setAttribute("contenteditable", "false")
                iconText.style.backgroundColor = ""
                iconText.style.textShadow = ""
                createdIcon.text = iconText.textContent
                createdIcon.file = editAddr + "/" + iconText.textContent

                //insert it into filesystem
                editFrom.new(Type,iconText.textContent)

                createdIcon.statNode(1)
                task.pocket.push(createdIcon)

                //refresh desktop if explorer is on vertex
                if (editFrom === sys.vertex) {
                    at(createdIcon.file).render()
                }

                iconText.blur()
                clearSelection()

                nullifyOnEvents(_this)
                task.wndw.node.removeEventListener("dfocus", iconNamingDelete)
            } else {
                //if the name not allowed --------------------|
                system.mem.var.shSelect = false
                iconText.style.backgroundColor = "#c90000"

                //insist -> keep only edited selected
                document.body.onclick = iconNamingInsist
                window.onkeyup = (e) => {if(e.key == "Enter" && e.shiftKey == false){
                    iconNamingInsist()
                    return false
                }}
                function iconNamingInsist(){
                    if (mem.dirObject.conf.addr == editAddr) {
                        for (icon of mem.iconArray){
                            icon.statNode(0)
                        }
                        createdIcon.statNode(1)
                        createdIcon.stat = 0

                        selectText(iconText)
                    } else {
                        system.mem.var.shSelect = true
                        nullifyOnEvents(_this)
                        task.wndw.node.removeEventListener("dfocus", iconNamingDelete)
                    }
                }
            }
        }
    }, 1) //TIMEOUT
}