import plexos from "../../../ini/system.js"
import {genRanHex, runLauncher} from "/plexos/lib/functions/dll.js"
import File from "../filesystem/file.js"
import Component from "../interface/component.js"
import EventBus from "./eventbus.js"
let System = plexos.System

export default class Task {
    static checkUniqueID(task){
        for (let i = 0; i < plexos.Tasks.length; i++){
            if (plexos.Tasks[i].id == task.id && plexos.Tasks[i] != task){
                task.id = genRanHex(16)
                Task.checkUniqueID(task)
            }
        }   
    }
    static canInstance(appID){
        for (let i = 0; i < plexos.Tasks.length; i++){
            if (plexos.Tasks[i].instantiable === false && plexos.Tasks[i].name === appName) return false
        }
        return true
    }
    static get(name){
        for (let i = 0; i < plexos.Tasks.length; i++){
            if (plexos.Tasks[i].name === name) return plexos.Tasks[i]
        }
        return null
    }
    static app(appID) {
        for (let i = 0; i < plexos.Tasks.length; i++){
            if (plexos.Tasks[i].appID === appID) return plexos.Tasks[i]
        }
        return null
    }
    static end(id) {
        Task.id(id).end()
    }
    static deleteSelectedNodes(pocket){
        const actor = plexos.System.mem.focused
        for(let icon of pocket){
            icon.deleteNode()
            if(File.at(icon.file)!=undefined) {
                if (actor?.cmd) actor.cmd("file.delete", {path: icon.file})
                else File.delete({path: icon.file})
            }
        }
    }
    static System() {
        return Task.get("System")
    }
    static id(id){
        let find = plexos.Tasks.filter(task => task.id === id)
        return find[0]
    }
    constructor(p) {
        if (!Task.canInstance(p.appID)) {
            Task.get(p.appID).focus()
            delete this
            return
        }
        this.appID = p.appID
        this.name = p.name
        this.node = p.node || this.node
        this.window = null
        this.load = 0
        this.tasks = []
        this.pocket = []
        this.windows = []
        this.blobList = []
        this.eventBus = new EventBus
        this.components = []
        this.mem = {
            var: {},
            arg: {},
            sfx: [],
        }
        this.listeners = []
        this.globalListeners = []   // <-- track global listeners
        this.id = (p.id !== undefined) ? p.id : genRanHex(16)
        Task.checkUniqueID(this)
        this.onEnd = p.onEnd || null
        plexos.Tasks.push(this)
    }

    end () {
        if (this.onEnd) this.onEnd()
        for (let styleTag of document.head.getElementsByClassName(this.id)) {
            styleTag.parentElement.removeChild(styleTag)
        }
        if (this.window) {
            this.window.deleteNode()
        }
        this.cleanupListeners()
        this.cleanupGlobalListeners()
        this.cleanupBlobUrls()
        plexos.Tasks = plexos.Tasks.remove(Task.id(this.id))
    }

    // ---- Local event bus methods (operate on this.eventBus) ----
    on(eventName, callback, priority = 0, id="") {
        this.eventBus.on(eventName, callback, priority, id)
        this.listeners.push({ eventName, callback, id})
    }
    off(eventName, callback, id="") {
        this.eventBus.off(eventName, callback, id)
        if (id!=="") {
            this.listeners = this.listeners.filter(listener => listener.id != id)
        } else {
            this.listeners = this.listeners.filter(listener => !(listener.eventName === eventName && listener.callback === callback))
        }
    }
    once(eventName, callback, priority=0, id="") {
        if (id==="") id = genRanHex(8)
        const wrapper = (...args) => {
            callback(...args)
            this.off(eventName, wrapper, id)
        }
        this.on(eventName, wrapper, priority, id)
    }
    emit(eventName, ...args) {
        this.eventBus.emit(eventName, ...args)
    }

    // ---- Global event bus via Command ----
    async cmd(command, args) {
        const Command = (await import('./command.js')).default
        const cmdObj = {
            appID: this.appID,
            author: this.name,
            taskId: this.id,
            command: command,
            arguments: args,
            timestamp: Date.now(),
            status: "queried",
            message: ""
        }
        return await Command.run(cmdObj)
    }

    cleanupListeners() {
        this.listeners.forEach(({eventName, callback, id}) => {
            this.eventBus.off(eventName, callback, id)
        })
        this.listeners = []
    }
    cleanupGlobalListeners() {
        this.globalListeners.forEach(({eventName, callback}) => {
            Task.System().bus.off(eventName, callback, this.id)
        })
        this.globalListeners = []
    }
    cleanupBlobUrls() {
        for (let url of this.blobList) URL.revokeObjectURL(url)
    }
    loader(bool) {
        (bool) ? this.load++ : this.load--
        this.load = (this.load < 0) ? 0 : this.load
        if (this.load === 0) {
            if (this.node) this.node.style.cursor = ""
        } else {
            if (this.node) this.node.style.cursor = "progress"
        }
    }
    focus() {
        if (Task.System().mem.focused === this) return
        if (Task.System().mem.focused) Task.System().mem.focused.blur()
        Task.System().mem.focused = this
        window.getSelection().removeAllRanges()
        if (this.window) {
            this.window.focus()
            this.window.statNode()
            let taskRange = this.mem.selectionRange
            if (taskRange && taskRange.commonAncestorContainer instanceof HTMLElement) {
                taskRange.commonAncestorContainer.focus()
            } else {
                taskRange = null
            }
        }
        document.activeElement.blur()
        if (this.onfocus) this.onfocus()
        if (this.node) this.node.focus()
        if (this.node?.onfocus) this.node.onfocus()
    }
    blur() {
        if (this.window) {
            if (window.getSelection().rangeCount) {
                this.mem.selectionRange = window.getSelection().getRangeAt(0).cloneRange()
            }
            if (this.mem.selectionRange && this.mem.selectionRange.commonAncestorContainer instanceof HTMLElement) {
                this.mem.selectionRange.commonAncestorContainer.blur()
            }
            this.window.blur()
            this.window.statNode()
            this.node.blur()
            if (this.node?.onblur) this.node.onblur()
        }
        if (this.onblur) this.onblur()
    }
    newWindow(arg) {
        let newWindow = new Window(arg)
        this.windows.push(newWindow)
    }
    async newComponent({url,container,args}) {
        let component = new Component ({
            url:url,
            task:this,
            args:args,
            container:container,
        })
        await component.display()
    }
    getComponent(id){
        let find = this.components.filter(component => component.id === id)
        return find[0]
    }
    popup(e, buttons, args) {
        this.mem.var.error = e
        this.mem.var.errorB = buttons
        runLauncher("/plexos/app/sys/Popup/popup.ls",
            {
                name:args.name,
                type:args.type,
                title:args.title,
                description:args.description,
                icon:args.icon,
                taskid:this.id,
            }
        )
    }
    logChange(type,path,args=null) {
        // to be implemented later
    }
    undo() {
        // to be implemented later
    }
    async askPermission(appID, allowance) {
        let appName = appID
        try {
            appName = plexos.Core.registry.resolveIndex(appID).name
        } catch {}

        return new Promise((resolve) => {
            let settled = false
            const finish = (granted) => {
                if (settled) return
                settled = true
                if (granted) {
                    try {
                        const params = plexos.Core.registry.getAppParams(appID)
                        if (params && Array.isArray(params.systemPermissions)) {
                            if (!params.systemPermissions.includes(allowance)) params.systemPermissions.push(allowance)
                            const generic = String(allowance).split(".")[0]
                            if (generic && !params.systemPermissions.includes(generic)) {
                                params.systemPermissions.push(generic)
                            }
                        }
                    } catch {}
                }
                resolve(!!granted)
            }

            this.popup(null, [
                ["Allow", () => finish(true)],
                ["Deny", () => finish(false)],
            ], {
                name: "Permission",
                type: false,
                title: "Permission required",
                description: `${appName} is requesting <b>${allowance}</b>.`,
                icon: "",
                taskid: this.id,
            })
        })
    }
}