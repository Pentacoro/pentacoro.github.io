import Task from "/plexos/lib/classes/system/task.js"
import Window from "/plexos/lib/classes/interface/window.js"
import File from "/plexos/lib/classes/filesystem/file.js"
import {displayComponent} from "/plexos/lib/functions/dll.js"

export default {
    app: `Explorer`,
    run: async function({taskid,appid,args,path,root}){
        let html = root + "/explorer.html"

        //on app init
        function ini() {
            let task = Task.id(taskid)
            let arg  = task.mem.arg
            
            arg.address  = args.path
            arg.mode     = args.mode || null
            arg.fileName = args.fileName || ""
            arg.types    = args.types || []
            arg.onResult = args.onResult || null
        }
        //on app end
        function end() {

        }

        //task creation
        let task = new Task(
            {
                appID: /APPID/,
                name : "Explorer",
                onEnd : end,
                node : null,
                id   : taskid
            }
        )
        if (!task.id) return

        //window generation
        new Window(
            {
                name : args.name,
                task : task.id, 
                icon : (File.at(args.path)) ? File.at(args.path).cfg.icon.getImage() : "/THEME/icons/files/defaultDIR.svg",            }
        )

        ini()
        
        await displayComponent({
            url:html,
            taskid:task.id,
            container:task.node
        })
    }
}