import Task from "/plexos/lib/classes/system/task.js"
import Window from "/plexos/lib/classes/interface/window.js"
import File from "/plexos/lib/classes/filesystem/file.js"
import {displayComponent} from "/plexos/lib/functions/dll.js"

export function initialize({taskid,args,path,root}) {
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
            name : args.name + " - Properties",
            task : task.id, 
            icon : (File.at(args.cfg.path)) ? File.at(args.cfg.path).cfg.icon.getImage() : "/plexos/res/themes/Plexos Hyper/icons/files/defaultMSF.svg",
            appParams: {
                maximizeable: false,
                resizeable: false,
                sizeDrawMethod: "fit-content"
            }
        }
    )

    ini()
    
    displayComponent({
        url:html,
        taskid:task.id,
        container:task.node
    })
}