import Task from "/plexos/lib/classes/system/task.js"
import Window from "/plexos/lib/classes/interface/window.js"
import File from "/plexos/lib/classes/filesystem/file.js"
import {displayComponent} from "/plexos/lib/functions/dll.js"

export function initialize({taskid,args,path,root}){
    let html = root + "/monaco.html"

    //on app init
    function ini() {
        let mem = Task.id(taskid).mem
        mem.arg.file          = File.at(args.path)
        mem.arg.fileData      = File.at(args.path).data
        mem.arg.fileExtension = File.at(args.path).cfg.exte
    }
    //on app end
    function end() {

    }

    //task creation
    let task = new Task(
        {
            name : "Monaco",
            instantiable : true,
            onEnd : end,
            node : null,
            from : "",
            id   : taskid
        }
    )
    if (!task.id) return

    //window generation
    new Window(
        {
            name : File.at(args.path).name+" - Monaco",
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