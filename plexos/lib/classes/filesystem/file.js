import plexos from "../../../../boot/plexos.js"
import typeClass from "./filetypes.js"
import Configuration from "./configuration.js"
import {renameKey, runLauncher, calculateStringSize, genRanHex} from  "../../functions/dll.js"
import {themeRoot} from "../../functions/theme.js"
import FileLock from "../system/fileLock.js"

export default class File {
    // Virtual paths start at "@", the root of the core: "@/home/desks/desktop". A path starting with "/"
    // is an HTTP request for a real file of the site, never a lookup here.
    static root = "@"

    // The bin holds what it's given in an array of wrappers, so two things with one name can sit in it:
    // { id, recycled: <timestamp>, from: <folder it came from>, place?, file }. A recycled file's path is "@/trash/<id>".
    // place is where it sat on the desktop, when it came from there (see Desktop's mem.placeOf)
    static trashPath = "@/trash"

    static isBin(node) {
        return Array.isArray(node?.dir)
    }

    static inBin(path) {
        return typeof path === "string" && path.startsWith(File.trashPath + "/")
    }

    // The wrapper of something recycled, from its own path or the path of anything inside it
    static binEntry(path) {
        if (!File.inBin(path)) return null
        const id = path.slice(File.trashPath.length + 1).split("/")[0]
        const bin = File.at(File.trashPath)
        return File.isBin(bin) ? bin.dir.find(entry => entry.id === id) || null : null
    }

    // A folder's files, whichever way it holds them
    static children(node) {
        if (!node?.dir) return []
        return Array.isArray(node.dir) ? node.dir.map(entry => entry.file) : Object.values(node.dir)
    }

    // The bin's own icon shows empty or full
    static binChanged() {
        File.at(File.trashPath)?.render?.()
    }

    static isVirtual(path) {
        return path === File.root || (typeof path === "string" && path.startsWith(File.root + "/"))
    }

    // For typed addresses and old stored data: "", "/user/x" and "user/x" all become "@" paths.
    static toVirtual(path = "") {
        if (File.isVirtual(path)) return path
        const parts = String(path).split("/").filter(Boolean)
        if (parts[0] === File.root) parts.shift()
        return parts.length ? File.root + "/" + parts.join("/") : File.root
    }

    // Brings a stored core from "/user/..." paths to "@" paths, in place. Returns how many values changed, so 0
    // means it was already current. Touches only what holds virtual paths: every node's cfg.path and icon.file,
    // the keys of files.proxy, and the file entries of each desktop's icon.json. HTTP paths in data stay as they are.
    static migrateTree(tree) {
        let changed = 0
        const convert = (value) => {
            if (typeof value !== "string" || File.isVirtual(value)) return value
            changed++
            return File.toVirtual(value)
        }
        const visit = (node) => {
            if (!node?.cfg) return
            node.cfg.path = convert(node.cfg.path)
            if (node.cfg.icon) node.cfg.icon.file = convert(node.cfg.icon.file)
            const path = node.cfg.path
            if (path === "@/plexos/reg/files.proxy" && node.data && typeof node.data === "object") {
                for (const key of Object.keys(node.data)) {
                    const next = convert(key)
                    if (next === key) continue
                    node.data[next] = node.data[key]
                    delete node.data[key]
                }
            }
            if (/^@\/plexos\/cfg\/desks\/[^/]+\/icon\.json$/.test(path) && typeof node.data === "string") {
                try {
                    const config = JSON.parse(node.data)
                    const before = changed
                    for (const icon of config.icons || []) icon.file = convert(icon.file)
                    if (changed !== before) node.data = JSON.stringify(config, null, "\t")
                } catch { /* not JSON, nothing to convert */ }
            }
            for (const child of File.children(node)) visit(child)
        }
        visit(tree)
        changed += File.renameTopFolder(tree, "user", "home")
        changed += File.upgradeBin(tree)
        return changed
    }

    // Older cores keep the bin as a plain folder. It becomes the array of wrappers, and whatever was in it
    // gets an id of its own. Where it came from wasn't kept, so it would restore to home
    static upgradeBin(tree) {
        const bin = tree?.dir?.trash
        if (!bin?.cfg) return 0
        let changed = 0
        if (bin.cfg.exte !== "can") {
            bin.cfg.exte = "can"
            if (bin.cfg.icon) bin.cfg.icon.exte = "can"
            changed++
        }
        if (Array.isArray(bin.dir)) return changed
        const repath = (node, oldRoot, newRoot) => {
            if (!node?.cfg) return
            for (const key of ["path"]) if (typeof node.cfg[key] === "string") node.cfg[key] = newRoot + node.cfg[key].slice(oldRoot.length)
            if (node.cfg.icon?.file) node.cfg.icon.file = newRoot + node.cfg.icon.file.slice(oldRoot.length)
            for (const child of File.children(node)) repath(child, oldRoot, newRoot)
        }
        bin.dir = Object.values(bin.dir || {}).map(file => {
            const id = genRanHex(12)
            repath(file, file.cfg.path, File.trashPath + "/" + id)
            return { id, recycled: Date.now(), from: File.root + "/home", file }
        })
        return changed + 1
    }

    // Older cores call the user's folder "user". It's "home" now: the folder and every path through it move,
    // including files.proxy keys and desktop icon.json entries. Returns how many values changed.
    static renameTopFolder(tree, from, to) {
        const folder = tree?.dir?.[from]
        if (!folder || tree.dir[to]) return 0
        const oldRoot = File.root + "/" + from
        const newRoot = File.root + "/" + to
        let changed = 0
        const move = (value) => {
            if (typeof value !== "string" || (value !== oldRoot && !value.startsWith(oldRoot + "/"))) return value
            changed++
            return newRoot + value.slice(oldRoot.length)
        }
        const visit = (node) => {
            if (!node?.cfg) return
            node.cfg.path = move(node.cfg.path)
            if (node.cfg.icon) node.cfg.icon.file = move(node.cfg.icon.file)
            if (node.cfg.path === "@/plexos/reg/files.proxy" && node.data && typeof node.data === "object") {
                for (const key of Object.keys(node.data)) {
                    const next = move(key)
                    if (next === key) continue
                    node.data[next] = node.data[key]
                    delete node.data[key]
                }
            }
            if (/^@\/plexos\/cfg\/desks\/[^/]+\/icon\.json$/.test(node.cfg.path) && typeof node.data === "string") {
                try {
                    const config = JSON.parse(node.data)
                    const before = changed
                    for (const icon of config.icons || []) icon.file = move(icon.file)
                    if (changed !== before) node.data = JSON.stringify(config, null, "\t")
                } catch { /* not JSON, nothing to move */ }
            }
            for (const child of File.children(node)) visit(child)
        }
        delete tree.dir[from]
        tree.dir[to] = folder
        folder.name = to
        if (folder.cfg?.icon) folder.cfg.icon.name = to
        visit(tree)
        return changed + 1
    }

    // The live file at path, or null when it or any folder on the way is missing.
    // "parent" gives the folder holding it (null for the root). Only "@" paths resolve.
    static at(path = File.root, get = "file") {
        if (path === null || path === undefined) return null
        if (!File.isVirtual(path)) {
            console.warn(`File.at takes a virtual "@" path, got ${JSON.stringify(path)}`)
            return null
        }
        return File.walk(plexos.Core.file, path, get)
    }

    // Last segment. The root has none.
    static basename(path = "") {
        const parts = String(path).split("/").filter(Boolean)
        if (parts[0] === File.root) parts.shift()
        return parts[parts.length - 1] || ""
    }

    // The folder above path: "@/a/b" → "@/a", "@/a" → "@". The root has none, so "".
    static dirname(path = "") {
        const parts = String(path).split("/").filter(Boolean)
        if (parts[0] !== File.root || parts.length === 1) return ""
        parts.pop()
        return parts.join("/")
    }

    // Follows an "@" path through .dir from root. Works on the live core and on a stored JSON copy alike.
    static walk(root, path = File.root, get = "file") {
        if (!File.isVirtual(path)) return null
        const parts = String(path).split("/").filter(Boolean).slice(1)
        if (get === "parent") {
            if (parts.length === 0) return null
            parts.pop()
        }
        let node = root
        for (const part of parts) {
            if (Array.isArray(node?.dir)) {
                node = node.dir.find(entry => entry?.id === part)?.file
                if (!node) return null
                continue
            }
            if (!node?.dir || !Object.hasOwn(node.dir, part)) return null
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
        if (file.cfg.class === "DirectoryFile" && Array.isArray(file.dir)) {
            node.dir = file.dir.map(entry => ({ id: entry.id, recycled: entry.recycled, from: entry.from, place: entry.place, file: File.serializeNode(entry.file) }))
        } else if (file.cfg.class === "DirectoryFile") {
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

    static pendingWrites = new Set()

    // "file-written" on the system bus, once per path per tick, whoever changed the contents and however.
    // Listeners compare the contents themselves, so a write that changed nothing costs them nothing.
    static notifyWritten(path) {
        if (!path || plexos.Core?.mem?.booting || File.pendingWrites.has(path)) return
        File.pendingWrites.add(path)
        queueMicrotask(() => {
            File.pendingWrites.delete(path)
            plexos.System?.bus?.emit("file-written", { path })
        })
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
                defaults.iconImag = `${themeRoot()}/icons/files/images/folder.svg`
                defaults.confType = "DirectoryFile"
                defaults.skeyName = "dir"
                break
            case "MetaFile": 
                defaults.iconImag = `${themeRoot()}/icons/files/images/meta.svg`
                defaults.confType = "MetaFile"
                defaults.skeyName = "meta"
                break
            case "StringFile":
                defaults.iconImag = `${themeRoot()}/icons/files/images/text.svg`
                defaults.confType = "StringFile"
                defaults.skeyName = "data"
                break
            case "ProxyFile":
                defaults.iconImag = `${themeRoot()}/icons/files/images/proxy.svg`
                defaults.confType = "ProxyFile"
                defaults.skeyName = "data"
                break
            case "TrashCan":
                defaults.iconImag = `${themeRoot()}/icons/files/images/trash.svg`
                defaults.confType = "TrashCan"
                defaults.skeyName = "dir"
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
            const mem = task.mem
            if (mem?.dirObject?.cfg?.path !== path) continue
            if (typeof mem.createExplorerIcons === "function" || typeof mem.createDesktopIcons === "function") {
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
        if (File.isBin(parent)) throw new Error("Nothing can be created in the bin")
        const typeName = opts.Type || opts.type
        const defaults = File.classDefaults(typeName)
        const confType = defaults.confType
        const skeyName = defaults.skeyName
        let fileName = opts.name
        const extensionMatch = fileName.match(/(?:.(?<!\.))+$/s)
        const extension = (extensionMatch && fileName.includes(".")) ? extensionMatch[0] : ""
        const Type = await typeClass(typeName)
        const Icon = (opts.icon != null) ? opts.icon : await import("../interface/icon.js").then(module => new module.default(
            {
                class: confType,
                name: fileName,
                exte: (confType == "DirectoryFile") ? "dir" : extension,
                state: 0
            }
        ))

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
        if (File.isBin(parent)) {
            parent.dir.splice(parent.dir.findIndex(entry => entry.file === file), 1)
            File.binChanged()
        } else {
            delete parent.dir[file.name]
        }
        for (const fileView of File.viewsOpened(parent.cfg.path)) fileView.mem.getIcon(path)?.deleteNode?.()
        plexos.System?.bus?.emit("file-deleted", { path })
    }
    static remove({ path }) {
        const file = File.at(path)
        if (!file) return
        const fileWrap = {
            file: File.stringify(file),
            date: Date.now(),
            path: file.parent().cfg.path
        }
        const trash = File.at("@/trash")
        if (Array.isArray(trash.dir)) trash.dir.push(fileWrap)
        else trash.dir[file.name] = file
        File.delete({ path })
    }
    static restore({ path, timestamp }) {
        return File.restoreSerialized(File.at(path), path)
    }
    static move({ path, to, place = null }) {
        const file = File.at(path)
        const dest = File.at(to)
        const parent = file?.parent()
        if (!file || !dest || !parent) return
        const oldAddress = file.cfg.path
        // Into the bin a file is wrapped (id, when, where from); out of it, unwrapped
        const intoBin = File.isBin(dest)
        const fromBin = File.isBin(parent)
        if (!intoBin && dest.dir[file.name] && dest !== parent) {
            file.name = File.returnAvailableName(file.name, file.cfg.icon, dest)
            const extension = file.cfg.class === "DirectoryFile"
                ? "dir"
                : ((file.name.match(/\.(?:.(?<!\.))+$/s) || [""])[0] || "")
            file.cfg.exte = extension
            if (file.cfg.icon) {
                file.cfg.icon.name = file.name
                file.cfg.icon.exte = extension
            }
        }
        const id = intoBin ? genRanHex(12) : null
        const finalAddress = dest.cfg.path + "/" + (intoBin ? id : file.name)
        if (fromBin) parent.dir.splice(parent.dir.findIndex(entry => entry.file === file), 1)
        else delete parent.dir[File.basename(oldAddress)]
        if (intoBin) dest.dir.push({ id, recycled: Date.now(), from: parent.cfg.path, ...(place ? { place } : {}), file })
        else dest.dir[file.name] = file
        file.cfg.path = finalAddress
        if (file.cfg.icon) file.cfg.icon.file = finalAddress
        if (file.dir) File.rerouteChildren(file, oldAddress, finalAddress)
        plexos.Core?.registry?.rekeyFileEntries?.(oldAddress, finalAddress)
        for (let fileView of File.viewsOpened(parent.cfg.path)) {
            fileView.mem.getIcon(oldAddress)?.deleteNode?.()
        }
        file.render()
        if (intoBin || fromBin) File.binChanged()
        plexos.System?.bus?.emit("file-moved", { oldPath: oldAddress, newPath: finalAddress })
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
        File.notifyWritten(file.cfg.path)
        return file
    }
    static modify({ path, data, content, sys, cfg }) {
        const file = File.at(path)
        if (!file) return
        if (cfg && typeof cfg === "object") {
            if ("hidden" in cfg) file.cfg.hidden = cfg.hidden
            if ("edit" in cfg) file.cfg.edit = cfg.edit
            if (cfg.icon && file.cfg.icon) {
                const icon = file.cfg.icon
                const patch = cfg.icon
                if (patch.render) icon.render = patch.render
                if (patch.stickers) icon.stickers = JSON.parse(JSON.stringify(patch.stickers))
                if (Array.isArray(patch.layers)) icon.layers = patch.layers.map(item => ({ ...item }))
                if (patch.layered === true || patch.layered === false) icon.layered = patch.layered
                if (patch.sizes) icon.sizes = { ...patch.sizes }
                if ("image" in patch) icon.image = patch.image
            }
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
            File.notifyWritten(file.cfg.path)
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
        if (!file || !parent || File.isBin(parent)) return // in the bin a file is known by its id

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
        plexos.System?.bus?.emit("file-moved", { oldPath: oldAddress, newPath: newAddress })
        return renamedFile
    }

    static open(path) {
        const file = File.at(path)
        if (!file) return
        if (File.inBin(path)) { // recycled things are restored, not opened
            import("/plexos/app/sys/System/File Management/restore.js")
                .then(module => module.askRestore(path, plexos.System.mem.focused))
                .then(back => back && File.open(back))
            return
        }
        if (file.cfg.class !== "DirectoryFile") {
            const lock = FileLock.blocking(path)
            if (lock) return FileLock.deny(lock, path, plexos.System.mem.focused)
        }
        // any folder opens in Explorer, the bin included
        const launcher = plexos.Settings.apps[file.cfg.exte] || (file.cfg.class === "DirectoryFile" ? plexos.Settings.apps.dir : null)
        runLauncher(launcher, {name:file.name, path:file.cfg.path}, plexos.System.mem.focused)
    }

    render() {
        for (let fileView of File.viewsOpened(this.parent().cfg.path)) {
            const create = fileView.mem.createExplorerIcons || fileView.mem.createDesktopIcons
            create?.call(fileView.mem, [this])
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