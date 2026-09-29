import plexos from "../../../ini/system.js"
import typeClass from "./filetypes.js"
import Configuration from "./configuration.js"
import {renameKey, runLauncher, calculateStringSize} from  "../../functions/dll.js"

export default class File {
    static at(path = "", get = "file", from = `plexos.Core["file"]`) {
        //string: where we'll devour path one dir at a time as we build expression
        let string = path
        //steps: where we'll store each of the dirs extracted from string (useless for now)
        let steps = [from]
        //expression: where we'll build the object reference from the core to later be eval()
        let expression = from
        
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
                let parent = (expression===from && eval(from)===plexos.Core) ? plexos.Core : expression.slice(0,-(`.dir[\"${steps[steps.length - 1]}\"]`.length))
                return ((eval(parent)!=undefined) ? eval(parent) : null)
                break
        }
    }

    static stringify(file) {
        const newJSON = {}
        const sKey = File.classDefaults(file.cfg.class).skeyName

        newJSON.name = file.name
        newJSON.cfg = file.cfg

        newJSON[sKey] = (plexos.Core.mem.classCompilers[file.cfg.class]) ? plexos.Core.mem.classCompilers[file.cfg.class]() : file[sKey]

        return JSON.stringify(newJSON)
    }

    static classDefaults(Type) {
        let defaults = {
            iconImag : null,
            confType : null,
            skeyName : null,
        }
        
        switch (Type) {
            case "DirectoryFile":
                defaults.iconImag = "plexos/res/themes/Plexos Hyper/icons/files/defaultDIR.svg"
                defaults.confType = "DirectoryFile"
                defaults.skeyName = "dir"
                break
            case "MetaFile": 
                defaults.iconImag = "plexos/res/themes/Plexos Hyper/icons/files/defaultMSF.svg"
                defaults.confType = "MetaFile"
                defaults.skeyName = "meta"
                break
            case "StringFile":
                defaults.iconImag = "plexos/res/themes/Plexos Hyper/icons/files/defaultTXT.svg"
                defaults.confType = "StringFile"
                defaults.skeyName = "data"
                break
            case "ProxyFile":
                defaults.iconImag = "plexos/res/themes/Plexos Hyper/icons/files/proxy.svg"
                defaults.confType = "ProxyFile"
                defaults.skeyName = "data"
                break
        }
    
        return defaults
    }

    static validName = function (string) {
        if (
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

    static viewsOpened = function (path) {
        let fileViews = []
        for (let task of plexos.Tasks) {
            if ((task.name === "Explorer" || task.name === "Desktop") && task.mem.dirObject.cfg.path === path) {
                fileViews.push(task)
            }
        }
        return fileViews
    }

    static async create
    (   
        path,
        type, 
        name, 
        icon = null, 
        conf = null, 
        cont = null,
        log = true,
    ) {
        let parent = File.at(path)

        let defaults = File.classDefaults(type)
        let confType = defaults.confType
        let skeyName = defaults.skeyName
        let extension = name.match(/(?:.(?<!\.))+$/s)[0]
        let Type = await typeClass(type)
        let Icon = (icon!=null) ? icon : await import("../interface/icon.js").then(module => new module.default(
            {
                class: confType, 
                name: name, 
                exte: (confType=="DirectoryFile") ? "dir" : extension, 
                state: 0
            }
    ))

        name = name + (((confType!="DirectoryFile") && !name.includes(".")) ? "." + extension : "")

        parent.dir[name] = new Type
        (
            {
                name : name,
                cfg  : conf || new Configuration (
                {
                    class : confType,
                    move : true,
                    exte : (confType=="DirectoryFile") ? "dir" : extension,
                    icon : Icon
                }),
                [skeyName] : cont
            }
        )

        parent.dir[name].cfg.path = parent.cfg.path+ "/" + name
        parent.dir[name].cfg["icon"].file = parent.cfg.path+ "/" + name

        //if (log) plexos.Core.logChange("create",parent.dir[name].cfg.path)

        return parent.dir[name]
    }

    static delete({path, log=true}) {
        const file = File.at(path)
        const parent = File.at(path,"parent")

        //if (log) plexos.Core.logChange("delete",child.cfg.path)

        delete parent.dir[file.name]
    }
    static remove ({path, log=true}) {
        let fileWrap = {
            file : File.stringify(file),
            date : Date.now(),
            path : File.at(file, "parent").path
        }
        File.at("/trash").dir.push(fileWrap)
        File.delete(file)
    }
    static restore({path, timestamp, log=true}) {

    }
    static move({path, to, log=true}) {
        
    }
    static read({path}) {

    }
    static write({path, data, log=true}) {

    }
    static modify({path, sys, log=true}) {

    }
    static rename({path, rename, log=true}) {
        const file = File.at(path)
        const parent  = File.at(path,"parent")

        rename = File.returnAvailableName(rename,null,file.parent())

        let newAddress = "" + parent.cfg.path + "/" + rename
        let oldAddress = file.cfg.path
        let oldName = file.name

        file.cfg.path = newAddress
        file.cfg.icon.file = newAddress

        if (file.dir) rerouteChildren(file)

        function rerouteChildren(parent) {
            for (let pair of Object.entries(parent.dir)) {
                let file = pair[1]
                file.cfg.path = file.cfg.path.replace(oldAddress, newAddress)
                file.cfg.icon.file = file.cfg.icon.file.replace(oldAddress, newAddress)
                if (file.exte === "dir") rerouteChildren(file)
            }
        }

        renameKey(parent.dir, file.name, rename)

        let renamedFile = parent.dir[rename]
        let extension = ((file.cfg.class==="DirectoryFile") ? "dir" : (rename.match(/\.(?:.(?<!\.))+$/s)!=null) ? rename.match(/(?:.(?<!\.))+$/s)[0] : "")

        renamedFile.name = rename
        renamedFile.cfg.exte = extension
        renamedFile.cfg.icon.name = rename
        renamedFile.cfg.icon.exte = extension

        for (let fileView of File.viewsOpened(parent.cfg.path)) {
            fileView.mem.getIcon(oldAddress)?.rename(newAddress)
        }

        //if (log) plexos.Core.logChange("repath",file.cfg.path,{oldPath:oldAddress})
    }

    static open(path) {
        const file = File.at(path)
        runLauncher(plexos.Settings.apps[file.cfg.exte], {name:file.name, path:file.cfg.path}, plexos.System.mem.focused)
    }

    render() {
        for (let fileView of File.viewsOpened(this.parent().cfg.path)) {
            fileView.mem["create"+fileView.name+"Icons"]([this])
        }
    }

    parent() {
        return File.at(this.cfg.path, "parent")
    }

    displayName() {
        return this.name.replace(/\.(?:.(?<!\.))+$/s, "")
    }

    size(unit=null,data=true) {
        let formatter = new Intl.NumberFormat('en-UK', {maximumFractionDigits:2})

        let byteSize = calculateStringSize(
            (data) ? JSON.stringify(JSON.parse(File.stringify(this))[File.classDefaults(this.cfg.class).skeyName]).replace(/^\s*"([^"]*)"\s*$/, '$1') : 
            `"${this.name}":${File.stringify(this)}`
        )

        if        (byteSize < Math.pow(1024, 1) || unit==="bytes") {
            return formatter.format(byteSize) + " bytes"
        } else if (byteSize < Math.pow(1024, 2) || unit==="KB") {
            return formatter.format(byteSize / Math.pow(1024, 1)) + " KB"
        } else if (byteSize < Math.pow(1024, 3) || unit==="MB") {
            return formatter.format(byteSize / Math.pow(1024, 2)) + " MB"
        } else if (byteSize < Math.pow(1024, 4) || unit==="GB") {
            return formatter.format(byteSize / Math.pow(1024, 3)) + " GB"
        } else if (byteSize < Math.pow(1024, 5) || unit==="TB") {
            return formatter.format(byteSize / Math.pow(1024, 4)) + " TB"
        } else {
            return formatter.format(byteSize / Math.pow(1024, 5)) + " PB"
        }
    }
}