import plexos from "/boot/plexos.js"
import {getTask, selectText, clearSelection, nullifyOnEvents} from "/plexos/lib/functions/dll.js"
import { themeConstruct } from "/plexos/lib/functions/theme.js"
import { fitIconSize } from "/plexos/lib/classes/interface/icon.js"
import { coreReadOnly } from "/plexos/lib/functions/readOnly.js"
import Task from "/plexos/lib/classes/system/task.js"
import File from "/plexos/lib/classes/filesystem/file.js"
import ContextMenu from "/plexos/lib/classes/interface/contextmenu.js"
import { destinationAt, moveFiles } from "/plexos/app/sys/System/File Management/move.js"
import { askRestore } from "/plexos/app/sys/System/File Management/restore.js"

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
        themeConstruct("explorerIcon", this, {
            taskId: this.task,
            list: mem.ui.view.keyNodes.list,
        })
        //------------------------|
    
        this.statNode()
        this.clic()
        this.paintIcon()
        mem.fillDetails(this)
    }
    deleteNode(){
        this.node.parentNode.removeChild(this.node)
    
        Task.id(this.task).pocket = Task.id(this.task).pocket.remove(this)
        Task.id(this.task).mem.iconArray = Task.id(this.task).mem.iconArray.remove(this)
        mem.statusChanged?.()
        // Other views of the same folder (the desktop's too) lose the icon from File.move or File.delete themselves
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
                mem.dialog?.select(this)
                break
            case 2: 
                if(!this.node.classList.contains("moving")) this.node.className += " moving"
                break
            default: 
        }
        mem.statusChanged?.()
    }
    drag(e){
        dragMouseDown(e, this.node, this)

        function dragMouseDown(e, node, _this) {
            e = e || window.event
            e.preventDefault()
            let ship = null
            let armed = false
            const originX = e.clientX
            const originY = e.clientY
            const placeShip = (event) => {
                const halfW = ship.node.offsetWidth / 2 || 43
                const halfH = ship.node.offsetHeight / 2 || 43
                ship.node.style.left = (event.clientX - halfW) + "px"
                ship.node.style.top = (event.clientY - halfH) + "px"
            }
            
            //selecting happens on mousedown, so a drag carries the right icons (selection.js has the rules)
            const wasSelected = _this.state === 1
            if (System.mem.var.shSelect == true && !System.mem.var.dragging) {
                if (e.shiftKey) mem.selectRange(_this, e.ctrlKey)
                else if (!wasSelected && e.ctrlKey) mem.toggleSelected(_this)
                else if (!wasSelected) mem.selectOnly(_this)
            }
            for (let icon of Task.id(_this.task).pocket) icon.highlight(true)
    
            document.onmousemove = e => dragMouseMove(e, node)
            document.onmouseup   = e => dragMouseEnd(e, node)
    
            function dragMouseMove(e, node) {
                e.preventDefault()
                if (coreReadOnly()) return
                if (!armed) {
                    if (Math.hypot(e.clientX - originX, e.clientY - originY) < 3) return
                    armed = true
                }

                for (let icon of Task.id(_this.task).pocket){
                    icon.statNode(2)
                }

                if (!ship) {
                    ship = themeConstruct("dragShip", {
                        count: Task.id(_this.task).pocket.length,
                        image: _this.main().getImage(),
                        layer: document.getElementById("dragLayer"),
                        x: e.clientX - 43,
                        y: e.clientY - 43,
                    })
                }
                placeShip(e)
                System.mem.var.dragging = true
            }
    
            function dragMouseEnd(e, node) {
                e.preventDefault()
                document.onmousemove = null
                document.onmouseup   = null

                ship?.node.remove()
                ship = null
                const paths = Task.id(_this.task).pocket.map(icon => icon.file)
                const dest = System.mem.var.dragging ? destinationAt(e.clientX, e.clientY, paths) : null
    
                //a click without a drag settles the selection: plain keeps just this icon, Ctrl on an icon
                //that was already selected takes it out. Shift was settled on mousedown
                const clicked = !System.mem.var.dragging && e.button == 0
                for (let icon of Task.id(_this.task).pocket) icon.highlight(false)
                if (clicked && !e.shiftKey) {
                    if (e.ctrlKey && wasSelected) mem.toggleSelected(_this)
                    else if (!e.ctrlKey) mem.selectOnly(_this)
                } else {
                    for (let icon of Task.id(_this.task).pocket) icon.statNode(1)
                }
                System.mem.var.dragging = false
                if (dest) moveFiles(paths, dest, { x: e.clientX, y: e.clientY }, Task.id(_this.task))
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
        if (File.inBin(this.file)) { // restored, never opened. Once it's back, it opens from there
            const explorer = Task.id(this.task)
            askRestore(this.file, explorer).then(back => {
                if (!back) return
                if (File.at(back)?.cfg.class === "DirectoryFile") explorer.mem.navigate(back)
                else File.open(back)
            })
            return
        }
        if (this.exte == "dir" || this.exte == "can") {
            Task.id(this.task).mem.navigate(this.file)
        } else if (mem.dialog) {
            mem.dialog.pick(this)
        } else {
            File.open(this.file)
        }
    }
    render(){
        this.statNode()

        this.image = this.main().image
        this.class = this.main().class
        this.file = this.main().file
        this.name = this.main().name
        this.exte = this.main().exte

        this.paintIcon()
        this.keyNodes.text.textContent = this.name
        mem.fillDetails(this)
    }
    paintIcon() {
        const frame = this.keyNodes?.frame
        const square = this.keyNodes?.square
        const record = this.main?.()
        if (!frame || !square || !record?.paint) return
        const apply = () => {
            const style = getComputedStyle(frame)
            const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
            const padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
            const room = Math.min(frame.clientWidth - padX, frame.clientHeight - padY)
            if (room <= 0) return false
            const side = fitIconSize(room)
            square.style.width = side + "px"
            square.style.height = side + "px"
            record.paint(this.keyNodes, side)
            return true
        }
        if (apply()) return
        requestAnimationFrame(() => { apply() })
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
        if (coreReadOnly()) return
        let iconText = this.keyNodes.text
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
                    //a held file keeps its name
                    task.cmd("file.rename", {path: editFile.cfg.path, rename: iconText.textContent})
                        .then(renamed => { if (!renamed) iconText.textContent = editFile.name })
                }
    
                thisIcon.statNode(1)
                iconText.blur()
                clearSelection()
    
                nullifyOnEvents(iconText)
            } else {
                //if the name not allowed --------------------|
                System.mem.var.shSelect = false
                iconText.style.backgroundColor = "#ef0000"
    
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