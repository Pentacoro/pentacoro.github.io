import {plexos} from "/plexos/ini/system.js"
import Task from "/plexos/lib/classes/system/task.js"
import File from "/plexos/lib/classes/files/file.js"
import Window from "/plexos/lib/classes/interface/window.js"
import {displayComponent} from "/plexos/lib/functions/dll.js"
let System = plexos.System

export function initialize() {
    let params = /PARAMS/
    let taskid = /TASKID/
    let addr = /ADDR/
    let root = /ROOT/
    let html = root + "/metaCreator.html"

    //on app init
    function ini() {
        let task = Task.id(taskid)
        let arg  = task.mem.arg

        arg.file = File.at(params.addr)
    }
    //on app end
    function end() {

    }

    //task creation
    let task = new Task(
        {
            name : "Meta Creator",
            inst : true,
            onEnd : end,
            node : null,
            from : "System",
            id   : taskid
        }
    )
    if (!task.id) return

    //window generation
    new Window
    (
        {
            name : params.name,
            task : taskid, 
            rezi : false, 
            uiux : [], 
            icon : File.at(params.addr).cfg.icon.imag,
            stat : 1, 
            widt : 400, 
            heig : 120, 
            minW : 400,
            minH : 120
        }
    )
        
    ini()

    displayComponent({
        url:html,
        taskid:taskid,
        container:task.node
    })
}