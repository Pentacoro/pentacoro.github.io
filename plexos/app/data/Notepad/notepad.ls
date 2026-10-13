import Task from "/plexos/lib/classes/system/task.js"
import Window from "/plexos/lib/classes/interface/window.js"
import File from "/plexos/lib/classes/filesystem/file.js"
import {displayComponent} from "/plexos/lib/functions/dll.js"

export default {
    application: `Notepad`,
    run: async function({taskid,appid,args,path,root}){
        let html = root + "/notepad.html"
        const file = args?.path ? File.at(args.path) : null

        //on app init
        function ini() {
            let task = Task.id(taskid)
            let arg  = task.mem.arg

            arg.textData = file?.data ?? ""
            arg.fileAddr = file ? args.path : null
        }
        //on app end. Return false to keep the window open.
        async function end() {
            const app = Task.id(taskid)
            if (typeof app?.mem?.confirmUnsaved === "function") return await app.mem.confirmUnsaved()
        }

        //task creation
        let task = new Task(
            {
                appID: /APPID/,
                name : "Notepad",
                onEnd : end,
                node : null,
                id   : taskid
            }
        )
        if (!task.id) return

        //window generation
        new Window(
            {
                name : (file ? file.name : "Untitled") + " - Notepad",
                task : task.id, 
                icon : file ? file.cfg.icon.getImage() : "/THEME/icons/files/defaultTXT.svg",
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