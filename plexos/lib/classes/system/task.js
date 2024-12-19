import {plexos} from "../../../ini/system.js"
import {genRanHex} from "/plexos/lib/functions/dll.js"
import File from "../files/file.js"
import Component from "../interface/component.js"
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
            if (plexos.Tasks[i].inst === false && plexos.Tasks[i].name === appName) return false
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
            Task.get("System").mem.focus(Task.get(p.name))
            delete this
            return
        }

        this.name = p.name
        this.apps = p.apps
        this.from = p.from || this.from

        this.inst = (p.inst===null) ? true : p.inst
        this.node = p.node || this.node

        this.window = null

        this.load = 0
        this.tasks = []
        this.pocket = []
        this.windows = []
        this.blobList = []
        this.components = []

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
    on(eventName, callback, priority = 0) {
        const wrappedCallback = (...args) => callback(...args, this)
        Task.get("System").bus.on(eventName, wrappedCallback, priority)
        this.listeners.push({ eventName, callback: wrappedCallback})
    }
    emit(eventName, ...args) {
        Task.get("System").bus.emit(eventName, ...args)
    }
    cleanupListeners() {
        this.listeners.forEach(({ eventName, callback }) => {
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
        window.getSelection().removeAllRanges()
        if (this.window) {
            this.window.focus(true)
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
            this.window.focus(false)
			this.node.blur()
            if (this.node?.onblur) this.node.onblur()
        }
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
    popup({e, buttons, arg}) {
        this.mem.var.error = e
        this.mem.var.errorB = buttons
        runLauncher("/plexos/app/sys/Popup/popup.lau.js",
            {
                name:arg.name,
                type:arg.type,
                title:arg.title,
                description:arg.description,
                icon:arg.icon,
                taskid:this.id,
            }
        )
    }
}