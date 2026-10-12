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

    static basename(path = "") {
        const parts = String(path).split("/").filter(Boolean)
        return parts[parts.length - 1] || ""
    }

    static dirname(path = "") {
        const parts = String(path).split("/").filter(Boolean)
        parts.pop()
        return parts.length ? "/" + parts.join("/") : ""
    }

    static jsonAt(root, path = "", get = "file") {
        const parts = String(path).split("/").filter(Boolean)
        if (get === "parent") {
            if (parts.length === 0) return null
            parts.pop()
        }
        let node = root
        for (const part of parts) {
            if (!node?.dir || node.dir[part] === undefined) return null
            node = node.dir[part]
        }
        return node
    }

    static serializeNode(file) {
        // Walk the VFS without JSON.stringify hitting live Tasks or Proxy toJSON/then traps.
        if (!file) return null
        const sKey = File.classDefaults(file.cfg.class).skeyName
        const node = {
            name: file.name,
            cfg: file.cfg,
        }
        if (file.cfg.class === "DirectoryFile") {
            node.dir = {}
            for (const [name, child] of Object.entries(file.dir || {})) {
                node.dir[name] = File.serializeNode(child)
            }
        } else {
            const compiler = plexos.Core?.mem?.classCompilers?.[file.cfg.class]
            node[sKey] = compiler ? compiler(file) : file[sKey]
        }
        return JSON.parse(JSON.stringify(node, (key, value) => {
            if (key === "node" || typeof value === "function") return undefined
            return value
        }))
    }

    static stringify(file) {
        return JSON.stringify(File.serializeNode(file))
    }

    static payloadKey(fileOrClass) {
        const Type = typeof fileOrClass === "string" ? fileOrClass : fileOrClass.cfg.class
        return File.classDefaults(Type).skeyName
    }

    static async restoreSerialized(serialized, path) {
        const parentPath = File.dirname(path)
        const parent = File.at(parentPath)
        if (!parent) throw new Error(`Parent missing for ${path}`)
        const Type = serialized.cfg?.class || "StringFile"
        const sKey = File.classDefaults(Type).skeyName
        await File.create({
            path: parentPath,
            Type,
            name: serialized.name,
            conf: serialized.cfg,
            content: serialized[sKey],
        })
        if (Type === "DirectoryFile" && serialized.dir) {
            const created = File.at(path)
            created.dir = {}
            for (const child of Object.values(serialized.dir)) {
                await File.restoreSerialized(child, `${path}/${child.name}`)
            }
        }
        return File.at(path)
    }

    static writeSerialized(path, serialized) {
        const file = File.at(path)
        if (!file || !serialized) return
        const sKey = File.classDefaults(file.cfg.class).skeyName
        if (file.cfg.class === "DirectoryFile") return
        File.write({ path, data: serialized[sKey] })
    }

    static refreshViews() {
        for (const task of plexos.Tasks) {
            if (task.name === "Explorer" && task.mem?.refresh) task.mem.refresh()
            if (task.name === "Desktop" && task.mem?.refresh) task.mem.refresh()
        }
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

    static async create(pathOrOpts, type, name, icon = null, conf = null, cont = null) {
        const opts = (typeof pathOrOpts === "object" && pathOrOpts !== null && type === undefined)
            ? pathOrOpts
            : { path: pathOrOpts, Type: type, name, icon, conf, content: cont }

        const path = opts.path
        const parent = File.at(path)
        if (!parent) throw new Error(`Cannot create file: missing directory ${path}`)
        const typeName = opts.Type || opts.type
        const defaults = File.classDefaults(typeName)
        const confType = defaults.confType
        const skeyName = defaults.skeyName
        let fileName = opts.name
        const extensionMatch = fileName.match(/(?:.(?<!\.))+$/s)
        const extension = extensionMatch ? extensionMatch[0] : ""
        const Type = await typeClass(typeName)
        const Icon = (opts.icon != null) ? opts.icon : await import("../interface/icon.js").then(module => new module.default(
            {
                class: confType,
                name: fileName,
                exte: (confType == "DirectoryFile") ? "dir" : extension,
                state: 0
            }
        ))

        fileName = fileName + (((confType != "DirectoryFile") && !fileName.includes(".")) ? "." + extension : "")

        const content = (opts.content != null)
            ? opts.content
            : (skeyName === "meta" ? {} : opts.content)

        parent.dir[fileName] = new Type(
            {
                name: fileName,
                cfg: opts.conf || new Configuration(
                    {
                        class: confType,
                        move: true,
                        exte: (confType == "DirectoryFile") ? "dir" : extension,
                        icon: Icon
                    }),
                [skeyName]: content
            }
        )

        parent.dir[fileName].cfg.path = parent.cfg.path + "/" + fileName
        parent.dir[fileName].cfg["icon"].file = parent.cfg.path + "/" + fileName

        return parent.dir[fileName]
    }

    static delete({ path }) {
        const file = File.at(path)
        const parent = File.at(path, "parent")
        if (!file || !parent) return
        delete parent.dir[file.name]
    }
    static remove({ path }) {
        const file = File.at(path)
        if (!file) return
        const fileWrap = {
            file: File.stringify(file),
            date: Date.now(),
            path: file.parent().cfg.path
        }
        const trash = File.at("/trash")
        if (Array.isArray(trash.dir)) trash.dir.push(fileWrap)
        else trash.dir[file.name] = file
        File.delete({ path })
    }
    static restore({ path, timestamp }) {
        return File.restoreSerialized(File.at(path), path)
    }
    static move({ path, to }) {
        const file = File.at(path)
        const dest = File.at(to)
        const parent = file?.parent()
        if (!file || !dest || !parent) return
        const oldAddress = file.cfg.path
        const newAddress = dest.cfg.path + "/" + file.name
        if (dest.dir[file.name] && dest !== parent) {
            file.name = File.returnAvailableName(file.name, file.cfg.icon, dest)
        }
        const finalAddress = dest.cfg.path + "/" + file.name
        delete parent.dir[File.basename(oldAddress)]
        dest.dir[file.name] = file
        file.cfg.path = finalAddress
        if (file.cfg.icon) file.cfg.icon.file = finalAddress
        if (file.dir) File.rerouteChildren(file, oldAddress, finalAddress)
        plexos.Core?.registry?.rekeyFileEntries?.(oldAddress, finalAddress)
        for (let fileView of File.viewsOpened(parent.cfg.path)) {
            fileView.mem.getIcon(oldAddress)?.deleteNode?.()
        }
        file.render()
        return file
    }
    static read({ path }) {
        return File.at(path)
    }
    static write({ path, data, content }) {
        const file = File.at(path)
        if (!file) return
        const payload = data !== undefined ? data : content
        const sKey = File.classDefaults(file.cfg.class).skeyName
        if (file.cfg.class === "ProxyFile") {
            const wrap = file.constructor.convertToProxyModel
            const obj = (payload && typeof payload === "object") ? payload : {}
            file.data = wrap ? wrap(obj, file) : obj
        } else {
            file[sKey] = payload
        }
        return file
    }
    static modify({ path, data, content, sys, cfg }) {
        const file = File.at(path)
        if (!file) return
        if (cfg && typeof cfg === "object") {
            if ("hidden" in cfg) file.cfg.hidden = cfg.hidden
            if ("edit" in cfg) file.cfg.edit = cfg.edit
        }
        const patch = data ?? content ?? sys
        if (patch !== undefined) {
            const sKey = File.classDefaults(file.cfg.class).skeyName
            if (sKey === "dir") return file
            if (patch && typeof patch === "object" && !Array.isArray(patch) && file[sKey] && typeof file[sKey] === "object") {
                Object.assign(file[sKey], patch)
            } else {
                file[sKey] = patch
            }
        }
        return file
    }
    static rerouteChildren(dir, oldAddress, newAddress) {
        for (let pair of Object.entries(dir.dir)) {
            let child = pair[1]
            child.cfg.path = child.cfg.path.replace(oldAddress, newAddress)
            if (child.cfg.icon) child.cfg.icon.file = String(child.cfg.icon.file).replace(oldAddress, newAddress)
            if (child.dir) File.rerouteChildren(child, oldAddress, newAddress)
        }
    }
    static rename({ path, rename }) {
        const file = File.at(path)
        const parent = File.at(path, "parent")
        if (!file || !parent) return

        rename = File.returnAvailableName(rename, null, file.parent())

        let newAddress = "" + parent.cfg.path + "/" + rename
        let oldAddress = file.cfg.path

        file.cfg.path = newAddress
        if (file.cfg.icon) file.cfg.icon.file = newAddress

        if (file.dir) File.rerouteChildren(file, oldAddress, newAddress)
        plexos.Core?.registry?.rekeyFileEntries?.(oldAddress, newAddress)

        renameKey(parent.dir, file.name, rename)

        let renamedFile = parent.dir[rename]
        let extension = ((file.cfg.class === "DirectoryFile") ? "dir" : (rename.match(/\.(?:.(?<!\.))+$/s) != null) ? rename.match(/(?:.(?<!\.))+$/s)[0] : "")

        renamedFile.name = rename
        renamedFile.cfg.exte = extension
        if (renamedFile.cfg.icon) {
            renamedFile.cfg.icon.name = rename
            renamedFile.cfg.icon.exte = extension
        }

        for (let fileView of File.viewsOpened(parent.cfg.path)) {
            fileView.mem.getIcon(oldAddress)?.rename(newAddress)
        }
        return renamedFile
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