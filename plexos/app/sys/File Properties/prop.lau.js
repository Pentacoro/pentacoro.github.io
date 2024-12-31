import Task from "/plexos/lib/classes/system/task.js"
import Window from "/plexos/lib/classes/interface/window.js"
import File from "/plexos/lib/classes/files/file.js"
import {displayComponent} from "/plexos/lib/functions/dll.js"

export function initialize({taskid,args,addr,root}) {
    let html = root + "/prop.html"

    //on app init
    function ini() {
        let task = Task.id(taskid)
        task.mem.arg = args
    }
    //on app end
    function end() {

    }

    //task creation
    let task = new Task(
        {
            name : "File Properties",
            instantiable : true,
            onEnd : end,
            node : null,
            from : "Plexus",
            id   : taskid
        }
    )
    if (!task.id) return

    //window generation
    new Window(
        {
            name : "Properties: "+args.name,
            task : task.id, 
            resizeable : false, 
            icon : (File.at(args.cfg.addr)) ? File.at(args.cfg.addr).cfg.icon.image : "/plexos/res/themes/Plexos Hyper/icons/files/defaultMSF.svg",
            state : 1, 
        }
    )

    ini()
    
    displayComponent({
        url:html,
        taskid:task.id,
        container:task.node
    })
}