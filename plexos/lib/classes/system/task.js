import plexos from "../../../../boot/plexos.js"
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
        this.persistentWindows = [] // modal child windows stacked over this task
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

    async end () {
        if (this._ending) return
        this._ending = true
        let allow = true
        try {
            if (typeof this.onEnd === "function") allow = await this.onEnd()
        } catch (error) {
            this._ending = false
            throw error
        }
        if (allow === false) {
            this._ending = false
            return
        }
        for (let styleTag of document.head.getElementsByClassName(this.id)) {
            styleTag.parentElement.removeChild(styleTag)
        }
        for (const extra of [...(this.persistentWindows || [])]) {
            const extraTask = extra.task ? Task.id(extra.task) : null
            if (extraTask && extraTask !== this) extraTask.end()
            else extra.deleteNode?.()
        }
        this.persistentWindows = []
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
    topPersistentWindow() {
        const stack = this.persistentWindows || []
        return stack.length ? stack[stack.length - 1] : null
    }
    // Parent chrome first, then each dialog, so the top one stays in front of the main window.
    raiseUnderPersistent() {
        const stack = this.persistentWindows || []
        const top = stack.at(-1)
        if (!top) return
        if (this.window && this.window !== top) this.window.statNode()
        for (const win of stack) {
            if (win !== top) win.statNode()
        }
        top.statNode()
    }
    // Blink the top dialog instead of raising the parent.
    attentionPersistent() {
        const top = this.topPersistentWindow()
        if (!top) return
        this.raiseUnderPersistent()
        const owner = Task.id(top.task)
        if (owner && owner !== this) owner.focus()
        else {
            top.focus()
        }
        let n = 0
        if (top._attentionTimer) clearInterval(top._attentionTimer)
        top._attentionTimer = setInterval(() => {
            if (n % 2 === 0) top.blur()
            else top.focus()
            n++
            if (n >= 6) {
                clearInterval(top._attentionTimer)
                top._attentionTimer = null
                if (!top.node) return
                const ownerTask = Task.id(top.task)
                // Don't force focus back if the user switched windows mid-blink.
                if (Task.System().mem.focused === ownerTask) top.focus()
                else top.blur()
            }
        }, 80)
    }
    focus() {
        const top = this.topPersistentWindow()
        if (top) {
            const owner = Task.id(top.task)
            this.window?.blur() // parent stays unfocused until the stack is empty
            if (owner && owner !== this) {
                this.raiseUnderPersistent()
                owner.focus()
                return
            }
        }
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
        if (top && Task.id(top.task) === this) this.raiseUnderPersistent()
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
            if (this.node) this.node.blur()
            if (this.node?.onblur) this.node.onblur()
        }
        if (this.onblur) this.onblur()
    }
    newWindow(arg) {
        return this.persistentWindow(arg)
    }
    // Layered modal owned by this task: a separate child Task + Window (permission dialogs, later Save As, etc.).
    // Defaults to Popup, fit-content, centered on the parent; app / url / appParams override that. Parent is locked
    // and blurred while the stack is non-empty. Closing the last child unlocks and restores parent focus.
    async persistentWindow({
        name,
        url,
        args,
        onClose,
        savePosition = false,
        app = "Popup",
        icon = null,
        appParams = {},
    } = {}) {
        const Window = (await import("../interface/window.js")).default
        const { displayComponent, genRanHex } = await import("/plexos/lib/functions/dll.js")
        const appID = plexos.Core.registry?.tryGetAppID?.(app)
            || plexos.Core.registry?.tryGetAppID?.("Popup")
        const taskID = genRanHex(16)
        Task.checkUniqueID({ id: taskID })
        let closed = false
        const finishClose = () => {
            if (closed) return
            closed = true
            this.persistentWindows = (this.persistentWindows || []).filter(w => w.task !== taskID)
            if (onClose) onClose()
            if (this.persistentWindows.length) {
                const next = this.topPersistentWindow()
                next?.unlockModal?.()
                const owner = next ? Task.id(next.task) : null
                if (owner) owner.focus()
            } else {
                this.window?.unlockModal?.()
                queueMicrotask(() => this.focus()) // after the child node is gone, so z-order stays sane
            }
        }
        const childTask = new Task({
            appID,
            name: name || app,
            onEnd: finishClose,
            node: null,
            from: this.name,
            id: taskID
        })
        if (!childTask.id) {
            finishClose()
            return null
        }
        const win = new Window({
            name: name || app,
            task: taskID,
            icon,
            appParams: {
                minimizeable: false,
                maximizeable: false,
                resizeable: false,
                sizeDrawMethod: "fit-content",
                initialDrawPosition: "window",
                parentTaskId: this.id,
                saveDrawParameters: savePosition ? "window" : "disabled",
                windowKey: name || null,
                savePosition: !!savePosition,
                ...appParams,
            }
        })
        const beneath = this.topPersistentWindow()
        this.persistentWindows.push(win)
        this.window?.lockModal?.()
        beneath?.lockModal?.()
        beneath?.blur?.()
        childTask.mem.arg = Object.assign({ taskid: this.id }, args || {}) // never clobber this.mem.arg
        if (url) {
            await displayComponent({
                url,
                taskid: taskID,
                container: childTask.node
            })
        }
        this.window?.blur()
        const childOwner = Task.id(taskID)
        if (childOwner) childOwner.focus()
        return win
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
    // First use of persistentWindow: Allow / Deny, optional Remember writes the catalog.
    async askPermission(appID, allowance, prompt) {
        let appName = appID
        try {
            appName = plexos.Core.registry.resolveIndex(appID).name
        } catch {}

        return new Promise((resolve) => {
            let settled = false
            const finish = (granted) => {
                if (settled) return
                settled = true
                resolve(!!granted)
            }
            const rememberDecision = ({ checked, value }) => {
                if (!checked) return
                try {
                    const registry = plexos.Core.registry
                    const pointer = registry.resolveIndex(appID)
                    const entry = registry.appFile().data[pointer.bucket][pointer.name]
                    const key = value ? "systemPermissions" : "systemProhibitions"
                    const list = Array.isArray(entry[key]) ? [...entry[key]] : []
                    if (!list.includes(allowance)) list.push(allowance)
                    if (value) {
                        const generic = String(allowance).split(".")[0] // e.g. file.modify also grants "file"
                        if (generic && !list.includes(generic)) list.push(generic)
                    }
                    entry[key] = list
                } catch {}
            }

            this.persistentWindow({
                name: "Permission",
                url: "/plexos/app/sys/Popup/popupB.html",
                args: {
                    title: "Permission required",
                    description: prompt || `${appName} is requesting permission to ${allowance}.`,
                    checks: [{
                        id: "remember",
                        label: `Remember for ${appName}`,
                        action: rememberDecision,
                    }],
                    buttons: [
                        { label: "Allow", value: true, action: () => finish(true) },
                        { label: "Deny", value: false, action: () => finish(false) },
                    ],
                },
                onClose: () => finish(false),
            }).catch((e) => {
                console.error(e)
                finish(false)
            })
        })
    }
}