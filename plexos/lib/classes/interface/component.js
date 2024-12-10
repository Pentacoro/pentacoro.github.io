import {plexos} from "../../../ini/system.js"
import {displayComponent, genRanHex} from "/plexos/lib/functions/dll.js"
import File from "../files/file.js"
import Task from "../system/task.js"
import { nodeGetters } from "../../functions/dll.js"
let System = plexos.System

export default class Component {
    static checkUniqueID(component){
        for (let i = 0; i < component.task.components.length; i++){
            if (component.task.components[i].id == component.id && component.task.components[i] != component){
                component.id = genRanHex(16)
                Component.checkUniqueID(component)
            }
        }
    }
    constructor(p) {
        this.url  = p.url
        this.mem  = {}
        this.task = p.task
        this.node = null

        this.container = p.container
        this.blobList  = []

        this.args = p.args || null
        this.id = (p.id !== undefined) ? p.id : genRanHex(16)
        Component.checkUniqueID(this)

        this.task.components.push(this)
    }
    async display() {
        await displayComponent({
            env:this.task,
            url:this.url,
            taskid:this.task.id,
            container:this.container,
            compid:this.id,
        })
        this.container.classList.add("ID_"+this.id)
        nodeGetters(this.container,  "ID_"+this.id, "ID_"+this.task.window.id)
    }
}