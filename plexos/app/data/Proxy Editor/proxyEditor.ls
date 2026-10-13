import Task from "/plexos/lib/classes/system/task.js"
import Window from "/plexos/lib/classes/interface/window.js"
import File from "/plexos/lib/classes/filesystem/file.js"
import {displayComponent} from "/plexos/lib/functions/dll.js"

export default {
    application: `Proxy Editor`,
    run: async function({taskid,appid,args,path,root}){
        let html = root + "/proxyEditor.html"

        function ini() {
            let mem = Task.id(taskid).mem
            mem.arg.file = File.at(args.path)
            mem.arg.fileAddr = args.path
        }

        function end() {}

        let task = new Task(
            {
                appID: /APPID/,
                name : "Proxy Editor",
                onEnd: end,
                node : null,
                id   : taskid
            }
        )
        if (!task.id) return

        new Window(
            {
                name : File.at(args.path).name+" - Proxy Editor",
                task : task.id,
                icon : (File.at(args.path)) ? File.at(args.path).cfg.icon.getImage() : "/THEME/icons/files/proxy.svg",
                appParams: {
                    filePath: args.path,
                    sizeDrawMethod: "window",
                    minimizeable: true,
                    maximizeable: true,
                    resizeable: true,
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
