import Task from "/plexos/lib/classes/system/task.js"
import Window from "/plexos/lib/classes/interface/window.js"
import File from "/plexos/lib/classes/filesystem/file.js"
import {displayComponent} from "/plexos/lib/functions/dll.js"

export default {
    app: `Monaco`,
    run: async function({taskid,appid,args,path,root}){
        let html = root + "/monaco.html"

        //on app init
        function ini() {
            let mem = Task.id(taskid).mem
            mem.arg.fileAddr      = args.path
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
                appID: /APPID/,
                name : "Monaco",
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
                icon : (File.at(args.path)) ? File.at(args.path).cfg.icon.getImage() : "/THEME/icons/files/images/file.svg",
                appParams: {
                    minimizeable: true,
                    maximizeable: true,
                    resizeable: true,
                    sizeDrawMethod: "window",
                    saveDrawParameters: "app"
                }
            }
        )

        ini()

        await displayComponent({
            url:html,
            taskid:task.id,
            container:task.node
        })
    }
}