import {plexos, cfg} from "../../../ini/system.js"
import {renameKey, runLauncher} from  "../../functions/dll.js"
import Task from "../system/task.js"

export default class File {
    static at(addr = "", get = "file") {
        //string: where we'll devour addr one dir at a time as we build expression
        let string = addr
        //steps: where we'll store each of the dirs extracted from string (useless for now)
        let steps = ["plexos[\"core\"]"]
        //expression: where we'll build the object reference from the core to later be eval()
        let expression = "plexos[\"core\"]"
        
        //find first "/"
        let to = string.indexOf("/")
    
        iterate(to)
    
        function iterate(to){
            if (to > 0) { //if "/" is not the first char
                let nextDir = string.splice(0, to)[1] //get clean dir name
    
                string = string.splice(0, to - 1)[0] //repeat splice for return
                string = string.splice(0,1)[0] //razor out "/"
    
                steps.push(nextDir)
    
                expression += ".dir[\""+nextDir+"\"]"
    
                if (string.length > 0) {
                    to = string.indexOf("/")
                    iterate(to)
                } else { 
                    return expression 
                }
    
            } else if (to == 0) { //if "/" is the first char
                string = string.splice(0,1)[0] //razor out "/"
                if (string.length > 0) {
                    to = string.indexOf("/")
                    iterate(to)
                } else { 
                    return expression 
                }
    
            } else if (to < 0){ //if there's no "/" char
                if (string.length > 0) {
                    expression += ".dir[\""+string+"\"]"
                    steps.push(string)
                    return expression
                } else if (string === ""){ 
                    return expression 
                }
    
            }
        }
        //return requested output, otherwise return null
        switch (get) {
            case "file":
                return ((eval(expression)!=undefined) ? eval(expression) : null)
                break
            case "parent":
                let parent = (expression==="plexos[\"core\"]") ? expression : expression.slice(0,-(`.dir[\"${steps[steps.length - 1]}\"]`.length))
                return ((eval(parent)!=undefined) ? eval(parent) : null)
                break
        }
    }

    static typeDefaults(Type) {
        let defaults = {
            iconImag : null,
            confType : null,
            skeyName : null,
        }
        
        switch (Type) {
            case "Directory":
                defaults.iconImag = "plexos/res/themes/Plexos Hyper/icons/files/defaultDIR.svg"
                defaults.confType = "Directory"
                defaults.skeyName = "dir"
                break
            case "Metafile": 
                defaults.iconImag = "plexos/res/themes/Plexos Hyper/icons/files/defaultMSF.svg"
                defaults.confType = "Metafile"
                defaults.skeyName = "meta"
                break
            case "String":
                defaults.iconImag = "plexos/res/themes/Plexos Hyper/icons/files/defaultTXT.svg"
                defaults.confType = "String"
                defaults.skeyName = "data"
        }
    
        return defaults
    }

    static validName = function (string) {
        if (
            string.slice(-1) != "." &&
            string != "" &&
            string.match(/[\/"]/g) === null
        ) {return true}
        return false
    }

    static nameAvailable = function (text, icon, from){
        for (let [name, file] of Object.entries(from.dir)){
            if (file.name == text && file.cfg.icon != icon) {
                return false
            }
        }
        return true
    }

    static returnAvailableName(name,icon,from){
        if (!File.nameAvailable(name,icon,from)) {
            //get extension and remove it from name
            let extension = name.match(/\.(?:.(?<!\.))+$/s)
            extension = (extension!=null && extension.length > 0) ? extension[0] : ""
            name = name.replace(extension,"")

            //get name instance amount if there is one
            let amnt = name.match(/(?<!\w)\d+$/)
            amnt = (amnt!=null && amnt.length > 0) ? parseInt(amnt[0],10) : ""

            //get number of digits of name instance amount
            let dgts = (amnt!="") ? (""+amnt).length : 1

            //set name with instance amount, starting from two
            name = (amnt!="") ? name.slice(0,(name.length)-dgts) + (amnt+1) : name + " 2"
            name = name + extension

            return File.returnAvailableName(name,icon,from)
        }
        return name
    }

    delete() {
        let parent = this.parent()
        let child = this

        delete parent.dir[child.name]
        parent.checkCont()
    }
    move(dest) {
        
    }
    rename(rename) {
        let parent  = this.parent()

        rename = File.returnAvailableName(rename,null,this.parent())

        let newAddress = "" + parent.cfg.icon.file + "/" + rename
        let oldAddress = this.cfg.icon.file
        let oldName = this.name

        this.cfg.addr = newAddress
        this.cfg.icon.file = newAddress

        if (this.dir) rerouteChildren(this)

        function rerouteChildren(parent) {
            for (let pair of Object.entries(parent.dir)) {
                let file = pair[1]
                file.cfg.addr = file.cfg.addr.replace(oldAddress, newAddress)
                file.cfg.icon.file = file.cfg.icon.file.replace(oldAddress, newAddress)
                if (file.exte === "dir") rerouteChildren(file)
            }
        }

        renameKey(parent.dir, this.name, rename)
        
        let renamedFile = parent.dir[rename]
        let extension = (this.cfg.type==="Directory") ? "dir" : (rename.match(/\.(?:.(?<!\.))+$/s)!=null) ? rename.match(/(?:.(?<!\.))+$/s)[0] : ""
        renamedFile.name = rename
        renamedFile.cfg.exte = extension
        renamedFile.cfg.icon.name = rename
        renamedFile.cfg.icon.extension = extension

        if (parent===plexos.vtx) {
            let desktop = Task.get("Desktop")
            if  (desktop && desktop.mem.getIcon(oldName)?.node) {
                desktop.mem.getIcon(oldName).file = newAddress
                desktop.mem.getIcon(oldName).exte = extension
                desktop.mem.getIcon(oldName).name = rename
                desktop.mem.getIcon(rename).node.setAttribute("id", `Icon: ${rename}`)
                desktop.mem.getIcon(rename).poseNode()
            }
        }
    }

    render(taskid=null) {
        if (this.parent() === plexos.vtx) { //if is on current vertex / render on desktop
            let desktop = Task.get("Desktop")
            if (desktop) {
                if  (desktop.mem.getIcon(this.name)?.node) desktop.mem.getIcon(this.name).render()
                else desktop.mem.createDesktopIcons([this])
            }
        }
        if (taskid) { //if is on any other directory / render on explorer
            Task.id(taskid).mem.createExplorerIcons([this])
        }
    }

    open() {
        runLauncher(cfg.apps[this.cfg.exte], {name:this.name, addr:this.cfg.addr}, plexos.System.mem.focused)
    }

    parent() {
        return File.at(this.cfg.addr, "parent")
    }

    displayName() {
        return this.name.replace(/\.(?:.(?<!\.))+$/s, "")
    }

    size(unit=null) {
        let formatter = new Intl.NumberFormat('en-UK', {maximumFractionDigits:2})

        let byteSize = JSON.stringify(this).length * 2 + `"${this.name}":`.length * 2

        if (byteSize < 1024 || unit==="bytes") {
            return formatter.format(byteSize) + " bytes"
        } else if  (byteSize < Math.pow(1024, 2) || unit==="KB") {
            return formatter.format(byteSize / Math.pow(1024, 1)) + " KB"
        } else if (byteSize >= Math.pow(1024, 3) || unit==="MB") {
            return formatter.format(byteSize / Math.pow(1024, 2)) + " MB"
        } else if (byteSize >= Math.pow(1024, 4) || unit==="GB") {
            return formatter.format(byteSize / Math.pow(1024, 3)) + " GB"
        } else if (byteSize >= Math.pow(1024, 5) || unit==="TB") {
            return formatter.format(byteSize / Math.pow(1024, 4)) + " TB"
        } else if (byteSize >= Math.pow(1024, 6) || unit==="PB") {
            return formatter.format(byteSize / 1024) + " PB"
        }
    }
}