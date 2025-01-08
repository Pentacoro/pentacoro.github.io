import Task from "/plexos/lib/classes/system/task.js"
import Window from "/plexos/lib/classes/interface/window.js"
import File from "/plexos/lib/classes/filesystem/file.js"
import {displayComponent} from "/plexos/lib/functions/dll.js"

export function initialize({taskid,args,path,root}) {
    let html = root + "/notepad.html"

    //on app init
    function ini() {
        let task = Task.id(taskid)
        let arg  = task.mem.arg

        arg.textData = File.at(args.path).data
        arg.fileAddr = args.path
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
            name : File.at(args.path).name+" - Notepad",
            task : task.id, 
            resizeable : true, 
            buttons : [{class:"_", function: ()=>console.log("Minimize")},{class:"O", function: ()=>console.log("Maximize")}], 
            icon : (File.at(args.path)) ? File.at(args.path).cfg.icon.getImage() : "/plexos/res/themes/Plexos Hyper/icons/files/defaultFile.svg",
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