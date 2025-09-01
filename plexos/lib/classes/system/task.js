import {plexos} from "../../../ini/system.js"
import {genRanHex, runLauncher} from "/plexos/lib/functions/dll.js"
import File from "../filesystem/file.js"
import Component from "../interface/component.js"
import ChangeLog from "./changeLog.js"
let System = plexos.System

export default class Task {
    static checkUniqueID(task){
        for (let i = 0; i < plexos.Tasks.length; i++){
            if (plexos.Tasks[i].id == task.id && plexos.Tasks[i] != task){
                console.log(task)
                task.id = genRanHex(16)
                Task.checkUniqueID(task)
            }
        }
    }
    static canInstance(appName){
        for (let i = 0; i < plexos.Tasks.length; i++){
            if (plexos.Tasks[i].instantiable === false && plexos.Tasks[i].name === appName) return false
        }
        return true
    }
    static get(appName){
        for (let i = 0; i < plexos.Tasks.length; i++){
            if (plexos.Tasks[i].name === appName) return plexos.Tasks[i]
        }
        return null
    }
    static endTask(id) {
        Task.id(id).end()
    }
    static deleteSelectedNodes(pocket){
        for(let icon of pocket){
            icon.deleteNode()
            //delete from filesystem
            if(File.at(icon.file)!=undefined) File.at(icon.file).delete()
        }
    }
    static id(id){
        let find = plexos.Tasks.filter(task => task.id === id)
        return find[0]
    }
    constructor(p) {
        //check if instance allowed
        if (!Task.canInstance(p.name)) {
            Task.get(p.name).focus()
            delete this
            return
        }

        this.name = p.name
        this.apps = p.apps
        this.from = p.from || this.from

        this.instantiable = (p.instantiable===null) ? true : p.instantiable
        this.node = p.node || this.node

        this.window = null

        this.load = 0
        this.tasks = []
        this.pocket = []
        this.windows = []
        this.blobList = []
        this.changeLog = new ChangeLog
        this.components = []
        this.permissions = [] //file.write | file.read | task.listen | task.emit | task.execute
        this.registryPath = p.registryPath

        this.mem = {
            var: {},
            arg: {},
            sfx: [],
        }
        this.listeners = []
        this.id = (p.id !== undefined) ? p.id : genRanHex(16)
        Task.checkUniqueID(this)
        
        //end task
        this.onEnd = p.onEnd || null

        plexos.Tasks.push(this)
    }
    end () {
        if (this.onEnd) this.onEnd()

        //delete style tags
        for (let styleTag of document.head.getElementsByClassName(this.id)) {
            styleTag.parentElement.removeChild(styleTag)
        }
        //close window
        if (this.window) {
            this.window.deleteNode()
        }

        this.cleanupListeners()
        this.cleanupBlobUrls()
        plexos.Tasks = plexos.Tasks.remove(Task.id(this.id))
    }
    on(eventName, callback, priority = 0, id="") {
        Task.get("System").bus.on(eventName, callback, priority, id)
        this.listeners.push({ eventName, callback, id})
    }
    off(eventName, callback, id="") {
        Task.get("System").bus.off(eventName, callback, id)
        if (id!=="") {
            this.listeners = this.listeners.filter(listener => listener.id != id)
        } else {
            this.listeners = this.listeners.filter(listener => listener != {eventName, callback})
        }
    }
    once(eventName, callback, priority=0, id="") {
        if (id==="") id = genRanHex(8)
        const wrapper = (...args) => {
            callback(...args)
            this.off(eventName, wrapper, id) // Remove listener after first execution
        }
        let listener = this.listeners.filter(listener => listener.id == id)
        if (listener === undefined || listener.length===0) {
            this.on(eventName, wrapper, priority, id)
        }
    }

    emit(eventName, ...args) {
        Task.get("System").bus.emit(eventName, ...args)
    }

    cleanupListeners() {
        this.listeners.forEach(({eventName, callback}) => {
            Task.get("System").bus.off(eventName, callback)
        })
        this.listeners = []
    }
    cleanupBlobUrls() {
        for (let url of this.blobList) URL.revokeObjectURL(url)
    }
    loader(op) {
        (op) ? this.load++ : this.load--
        this.load = (this.load < 0) ? 0 : this.load

        if (this.load === 0) {
            if (this.node) this.node.style.cursor = ""
        } else {
            if (this.node) this.node.style.cursor = "progress"
        }
    }
    focus() {
        if (Task.get("System").mem.focused === this) return
        if (Task.get("System").mem.focused) Task.get("System").mem.focused.blur()
        Task.get("System").mem.focused = this
        window.getSelection().removeAllRanges()
        if (this.window) {
            this.window.focus()
            this.window.statNode()
            //restore select ranges
			let taskRange = this.mem.selectionRange
			if (taskRange && taskRange.commonAncestorContainer instanceof HTMLElement) {
				taskRange.commonAncestorContainer.focus()
				//selectRange(taskRange)
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
            //store select ranges
			if (window.getSelection().rangeCount) {
				this.mem.selectionRange = window.getSelection().getRangeAt(0).cloneRange()
			}
			if (this.mem.selectionRange && this.mem.selectionRange.commonAncestorContainer instanceof HTMLElement) {
				this.mem.selectionRange.commonAncestorContainer.blur()
				//selectRange(taskRange)
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
        //INCOMPLETE
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
        this.changeLog.addDirtyChange({
            type:type,            
            path:path,
            dir:File.at(path, "parent").cfg.path,
            app:this.name,
            args:args,
            isCommitted:false
        })
    }
    undo() {
        let lastChange = this.changeLog[this.changeLog.length - 1]

        if (!lastChange) return

        lastChange.undo()
        this.changeLog.pop()
    }
    async askPermission(allowance) {
        return new Promise (async (resolve, reject) => {
            await System.askPermission(this.id,"allowance")
        })
    }
}