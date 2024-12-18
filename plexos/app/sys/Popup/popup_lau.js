import {plexos} from "/plexos/ini/system.js"
import Task from "/plexos/lib/classes/system/task.js"
import Window from "/plexos/lib/classes/interface/window.js"
import {displayComponent} from "/plexos/lib/functions/dll.js"
let System = plexos.System

export function initialize() {
    let params = /PARAMS/
    let taskid = /TASKID/
    let addr = /ADDR/
    let root = /ROOT/
    let html = (params.type) ? root + "/popup.html" : root + "/popupB.html"

    //on app init
    function ini() {
        let task = Task.id(taskid)
        let arg  = task.mem.arg

        arg.title       = params.title
        arg.description = params.description
        arg.image       = params.image
        arg.taskid      = params.taskid || Task.get("System").id
    }
    //on app end
    function end() {

    }

    //task creation
    let task = new Task(
        {
            name : "Popup",
            inst : true,
            onEnd : end,
            node : null,
            from : "System",
            id   : taskid
        }
    )
    if (!task.id) return

    try {
        //window generation
        new Window
        (
            {
                name : params.name,
                task : taskid, 
                rezi : false, 
                uiux : [], 
                icon : (params.icon) ? params.icon : null,
                stat : 1, 
                widt : 400, 
                heig : 132, 
                minW : 400,
                minH : 132
            }
        )
            
        ini()

        displayComponent({
            url:html,
            taskid:taskid,
            container:task.node
        })
    } catch (e) {
        console.error(e)
        console.error(System.mem.var.error)
    }
}