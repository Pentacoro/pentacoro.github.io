import Task from "/plexos/lib/classes/system/task.js"
import Window from "/plexos/lib/classes/interface/window.js"
import File from "/plexos/lib/classes/filesystem/file.js"
import {displayComponent} from "/plexos/lib/functions/dll.js"

export function initialize({taskid,args,path,root}){
    let html = root + "/iframer.html"

    //on app init
    function ini() {
        let task = Task.id(taskid)
        let arg  = task.mem.arg
        
        arg.file = File.at(args.path)
    }
    //on app end
    function end() {

    }

    //task creation
    let task = new Task(
        {
            registryPath: `STANDALONE["Web Framer"]`,
            name : "Web Framer",
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
            icon : (File.at(args.path)) ? File.at(args.path).cfg.icon.getImage() : "/plexos/res/themes/Plexos Hyper/icons/files/defaultMSF.svg",
            appParams: {
                filePath: args.path,
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
