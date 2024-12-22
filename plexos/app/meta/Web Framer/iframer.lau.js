import Task from "/plexos/lib/classes/system/task.js"
import Window from "/plexos/lib/classes/interface/window.js"
import File from "/plexos/lib/classes/files/file.js"
import {displayComponent} from "/plexos/lib/functions/dll.js"

export function initialize({taskid,args,addr,root}){
    let html = root + "/iframer.html"

    //on app init
    function ini() {
        let task = Task.id(taskid)
        let arg  = task.mem.arg
        
        arg.file = File.at(args.addr)
    }
    //on app end
    function end() {

    }

    //task creation
    let task = new Task(
        {
            name : "Iframer",
            instantiable : true,
            onEnd : end,
            node : null,
            from : "Plexus",
            id   : taskid
        }
    )
    if (!task.id) return

    //window generation
    new Window
    (
        {
            name : args.name,
            task : task.id, 
            resizeable : true, 
            buttons : [{class:"_", function: ()=>console.log("Minimize")},{class:"O", function: ()=>console.log("Maximize")}], 
            icon : (File.at(args.addr)) ? File.at(args.addr).cfg.icon.image : "/plexos/res/themes/Plexos Hyper/icons/files/defaultMSF.svg",
            state : 1, 
            width  : 850, 
            height : 650, 
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
