import {plexos} from "/plexos/ini/system.js"
import {getTask, selectText, clearSelection, nullifyOnEvents} from "/plexos/lib/functions/dll.js"
import Task from "/plexos/lib/classes/system/task.js"
import File from "/plexos/lib/classes/filesystem/file.js"
import ContextMenu from "/plexos/lib/classes/interface/contextmenu.js"

let System = plexos.System
let task = getTask(/TASKID/)
let mem  = task.mem
mem.class = {}

mem.class.IconDir = class IconDir {
    constructor(p){
        this.state = 0
        this.file = p.file
        this.image = p.image
        this.class = p.class
        this.name = p.name
        this.exte = p.exte
        this.task = task.id

        this.drop = []
        this.main = function(){return File.at(this.file).cfg.icon}
    }
    createNode(){
        //Icon HTML structure-----|
        let newIcon = document.createElement("div")
        newIcon.setAttribute("class", "explorerIcon "+this.task)
        newIcon.setAttribute("title", this.name)

        let newIconImage = document.createElement("img")
        newIconImage.setAttribute("class", "explorerIconImage "+this.task)
        newIconImage.setAttribute("src", this.main().getImage())
        newIcon.appendChild(newIconImage)

        let newIconText = document.createElement("span")
        newIconText.setAttribute("class", "explorerIconText "+this.task)
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
        
        if (File.at(this.file)?.parent() === plexos.vtx && Task.get("Desktop")) { //delete desktop icon if file is from vertex
            let icon = Task.get("Desktop").mem.getIcon(File.at(this.file).cfg.icon.file)
            icon.deleteNode()
        }
    }
    statNode(num){
        //0 => unselected | 1 => selected | 2 => moving
        this.state = (num != undefined) ? num : this.state

        switch(this.state){
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
            if (_this.state === 1) {
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
                        iconShipImg.setAttribute("style", "background-image: url('"+_this.main().getImage()+"'); background-size: 68%;")
                    } else {
                        iconShipImg.setAttribute("style", "background-image: url('/plexos/res/themes/Plexos Hyper/icons/interface/fileDrag/pocket_ship_"+pockImg+".svg')")
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
        this.node.ondblclick = e => this.open()
        this.node.oncontextmenu = e => {
            let menu = mem.iconContextMenu(e,this)
            ContextMenu.open(e,this,menu)
        }
    }
    open(){
        if (this.exte == "dir") {
            Task.id(this.task).mem.explorerInit(this.file, this.task)
        } else {
            File.at(this.file).open()
        }
    }
    render(){
        this.statNode()

        this.image = this.main().image
        this.class = this.main().class
        this.file = this.main().file
        this.name = this.main().name
        this.exte = this.main().exte

        this.node.children[0].setAttribute("src", this.main().getImage())
        this.node.children[1].textContent = this.name
    }
    highlight(coin) {
        if (coin) {
            this.node.classList.add("highlight")
            return
        } 
        this.node.classList.remove("highlight")
    }
    rename(path) {
        this.file = path
        this.name = this.main().name
        this.exte = this.main().exte

        this.node.title = this.name

        this.render()
    }
    editName(e){
        let iconText = this.node.childNodes[1]
        let editFile = File.at(this.file)
        let editFrom = editFile.parent()
        let thisIcon = this
        //make h3 editable --------------------|
        iconText.setAttribute("contenteditable", "true")
        iconText.setAttribute("spellcheck", "false")
        
        //select h3 content --------------------|
        let exte = iconText.innerText.match(/\.(?:.(?<!\.))+$/s)
        exte = (exte!=null && exte.length > 0) ? exte[0] : ""
        this.statNode(1)
        this.state = 0
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
                File.nameAvailable(iconText.textContent, editFile.cfg.icon, editFrom) &&
                File.validName(iconText.textContent)
            ) {
                //if the name is allowed --------------------|
                System.mem.var.shSelect = true
                
                iconText.setAttribute("contenteditable", "false")
                iconText.style.backgroundColor = ""
                iconText.style.textShadow = ""
    
                //insert into fylesystem
                if (iconText.textContent != editFile.name) { //if the name changed
                    editFile.rename(iconText.textContent)
                }
    
                thisIcon.statNode(1)
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
                    thisIcon.state = 0
    
                    selectText(iconText)
                }
            }
        }
        }, 0) //TIMEOUT
    }
}