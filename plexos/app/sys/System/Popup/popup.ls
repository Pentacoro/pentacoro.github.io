import plexos from "/boot/plexos.js"
import Task from "/plexos/lib/classes/system/task.js"
import Window from "/plexos/lib/classes/interface/window.js"
import {displayComponent} from "/plexos/lib/functions/dll.js"
let System = plexos.System

export default {
    app: `Popup`,
    run: async function({taskid,appid,args,path,root}){
        let html = (args.type) ? root + "/popup.html" : root + "/popupB.html"

        //on app init
        function ini() {
            let task = Task.id(taskid)
            let arg  = task.mem.arg

            arg.title       = args.title
            arg.description = args.description
            arg.image       = args.image
            arg.taskid      = args.taskid || Task.System().id
            arg.details     = args.details || null
            arg.buttons     = args.buttons || null // { label, action } each. Without them the caller's errorB is used
            arg.detailsHeight = args.detailsHeight || null
        }
        //on app end
        function end() {
            if (typeof args.onClose === "function") args.onClose()

        }
        //task creation
        let task = new Task(
            {
                appID: /APPID/,
                name : "Popup",
                onEnd : end,
                node : null,
                from : "System",
                id   : taskid
            }
        )
        if (!task.id) return

        try {
            //window generation
            new Window
            (
                {
                    name : args.name,
                    task : taskid, 
                    icon : (args.icon) ? args.icon : null,
                    appParams: {
                        minimizeable: false,
                        maximizeable: false,
                        resizeable: false,
                        sizeDrawMethod: "fit-content",
                        initialDrawPosition: "window",
                        parentTaskId: args.taskid || null,
                        saveDrawParameters: "disabled"
                    }
                }
            )
                
            ini()

            await displayComponent({
                url:html,
                taskid:taskid,
                container:task.node
            })
        } catch (e) {
            console.error(e)
            console.error(System.mem.var.error)
        }
    }
}