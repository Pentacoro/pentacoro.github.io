import {plexos} from "/plexos/ini/system.js"
import {getTask, selectText, clearSelection, nullifyOnEvents} from "/plexos/lib/functions/dll.js"
import Task from "/plexos/lib/classes/system/task.js"
import File from "/plexos/lib/classes/files/file.js"
import ContextMenu from "/plexos/lib/classes/interface/contextmenu.js"

let System = plexos.System
let task = getTask(/TASKID/)
let mem  = task.mem
mem.class = {}

mem.class.IconDir = class IconDir {
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
                if (System.mem.var.shSelect == true && !System.mem.var.dragging) {
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
                System.mem.var.dragging = true
            }
    
            function dragMouseEnd(e, node) {
                e.preventDefault()
                document.onmousemove = null
                document.onmouseup   = null

                //empty dragLayer
                document.getElementById("dragLayer").innerHTML = ""
    
                //unselect other folders on mouseup W/O drag UNLESS ctrl
                if(e.ctrlKey == false && System.mem.var.dragging == false && e.button == 0) {
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
                System.mem.var.dragging = false
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
        selectText(iconText,0, iconText.innerText.replace(exte,"").length)
    
        iconText.style.textShadow = "none"
        iconText.style.display = "block"
    
        //restore -> leave icon unmodified
        document.body.oncontextmenu = iconRenamingRestore
        window.onkeydown = (e) => {if(e.key == "Escape"){
            iconRenamingRestore()
            return false
        }}
        function iconRenamingRestore(){
            System.mem.var.shSelect = true
            
            thisIcon.statNode()
    
            iconText.textContent = thisIcon.name
            iconText.setAttribute("contenteditable", "false");
            iconText.style.backgroundColor = ""
            iconText.style.textShadow = ""
    
            iconText.blur();
            clearSelection();
    
            nullifyOnEvents(iconText)
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
                System.mem.var.shSelect = true;
    
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
    
                        for (let icon of task.mem.iconArray) {
                            if (icon.name == iconText.textContent) {
                                icon.statNode(1)
                                task.pocket.push(icon)
                            }
                        }
                    }
                }
    
                thisIcon.statNode(0)
                iconText.blur()
                clearSelection()
    
                nullifyOnEvents(iconText)
            } else {
                //if the name not allowed --------------------|
                System.mem.var.shSelect = false
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
    
                    selectText(iconText)
                }
            }
        }
        }, 0) //TIMEOUT
    }
}