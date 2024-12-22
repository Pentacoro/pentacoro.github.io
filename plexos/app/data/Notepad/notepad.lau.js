import Task from "/plexos/lib/classes/system/task.js"
import Window from "/plexos/lib/classes/interface/window.js"
import File from "/plexos/lib/classes/files/file.js"
import {displayComponent} from "/plexos/lib/functions/dll.js"

export function initialize({taskid,args,addr,root}) {
    let html = root + "/notepad.html"

    //on app init
    function ini() {
        let task = Task.id(taskid)
        let arg  = task.mem.arg

        arg.textData = File.at(args.addr).data
        arg.fileAddr = args.addr
    }
    //on app end
    function end() {

    }

    //task creation
    let task = new Task(
        {
            name : "Notepad",
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
            name : File.at(args.addr).name+" - Notepad",
            task : task.id, 
            resizeable : true, 
            buttons : [{class:"_", function: ()=>console.log("Minimize")},{class:"O", function: ()=>console.log("Maximize")}], 
            icon : (File.at(args.addr)) ? File.at(args.addr).cfg.icon.image : "/plexos/res/themes/Plexos Hyper/icons/files/defaultFile.svg",
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