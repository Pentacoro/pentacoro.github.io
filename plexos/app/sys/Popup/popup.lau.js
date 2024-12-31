import {plexos} from "/plexos/ini/system.js"
import Task from "/plexos/lib/classes/system/task.js"
import Window from "/plexos/lib/classes/interface/window.js"
import {displayComponent} from "/plexos/lib/functions/dll.js"
let System = plexos.System

export function initialize({taskid,args,path,root}) {
    let html = (args.type) ? root + "/popup.html" : root + "/popupB.html"

    //on app init
    function ini() {
        let task = Task.id(taskid)
        let arg  = task.mem.arg

        arg.title       = args.title
        arg.description = args.description
        arg.image       = args.image
        arg.taskid      = args.taskid || Task.get("System").id
    }
    //on app end
    function end() {

    }
    //task creation
    let task = new Task(
        {
            name : "Popup",
            instantiable : true,
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
                name : args.name,
                task : taskid, 
                resizeable : false, 
                buttons : [], 
                icon : (args.icon) ? args.icon : null,
                state : 1
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