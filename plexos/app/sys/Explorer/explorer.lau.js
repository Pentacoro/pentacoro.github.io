import Task from "/plexos/lib/classes/system/task.js"
import Window from "/plexos/lib/classes/interface/window.js"
import File from "/plexos/lib/classes/filesystem/file.js"
import {displayComponent} from "/plexos/lib/functions/dll.js"

export function initialize({taskid,args,path,root}) {
    let html = (args.type) ? root + "/explorer"+args.type+".html" :  root + "/explorer.html"

    //on app init
    function ini() {
        let task = Task.id(taskid)
        let arg  = task.mem.arg

        arg.address = args.path
    }
    //on app end
    function end() {

    }

    //task creation
    let task = new Task(
        {
            name : "Explorer",
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
            name : args.name,
            task : task.id, 
            resizeable : true, 
            buttons : [{class:"_", function: ()=>console.log("Minimize")},{class:"O", function: ()=>console.log("Maximize")}], 
            icon : (File.at(args.path)) ? File.at(args.path).cfg.icon.image : "/plexos/res/themes/Plexos Hyper/icons/files/defaultDIR.svg",
            state : 1, 
            width  : 700, 
            height : 460, 
            minW : 192,
            minH : 160
        }
    )

    ini()
    
    displayComponent({
        url:html,
        taskid:task.id,
        container:task.node
    })
}