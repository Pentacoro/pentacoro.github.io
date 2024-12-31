import {plexos} from "/plexos/ini/system.js"
import Task from "/plexos/lib/classes/system/task.js"
import File from "/plexos/lib/classes/files/file.js"
import Window from "/plexos/lib/classes/interface/window.js"
import {displayComponent} from "/plexos/lib/functions/dll.js"
let System = plexos.System

export function initialize({taskid,args,path,root}) {
    if (args.window === undefined) args.window = true
    
    let html = root + ((args.window) ? "/metaCreator.html" : "/metaCreatorScript.html")

    //on app init
    function ini() {
        let task = Task.id(taskid)
        let arg  = task.mem.arg

        arg.file = File.at(args.path)
        if (args.url  != undefined) arg.url = args.url
        if (args.type != undefined) arg.type = args.type
    }
    //on app end
    function end() {

    }

    //task creation
    let task = new Task(
        {
            name : "Meta Creator",
            instantiable : true,
            onEnd : end,
            node : null,
            from : "System",
            id   : taskid
        }
    )
    if (!task.id) return

    //window generation
    if (args.window) {
        new Window
        (
            {
                name : args.name,
                task : taskid, 
                resizeable : false, 
                buttons : [], 
                icon : File.at(args.path).cfg.icon.image,
                state : 1, 
            }
        )
    }
        
    ini()

    displayComponent({
        url:html,
        taskid:taskid,
        container:(task.node) ? task.node : document.getElementById("systemLayer")
    })
}