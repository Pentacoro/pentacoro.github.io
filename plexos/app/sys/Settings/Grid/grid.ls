import Task from "/plexos/lib/classes/system/task.js"
import Window from "/plexos/lib/classes/interface/window.js"
import {displayComponent} from "/plexos/lib/functions/dll.js"

export default {
    app: `Desktop Grid Settings`,
    run: async function({taskid,appid,args,path,root}){
        let html = root + "/grid.html"

        //on app init
        function ini() {
            task.cmd("event.emit", {eventName: "desktop-grid-settings-open"})
        }

        //task creation
        let task = new Task(
            {
                registryPath: `SYSTEM["Settings"]`,
                name : "Desktop Grid Settings",
                node : null,
                from : "System", 
                id   : taskid
            }
        )
        if (!task.id) return

        //window generation
        new Window
        (
            {
                name : "Desktop Grid Settings",
                task : task.id, 
                icon : "/plexos/res/themes/Plexos Hyper/icons/files/settingsPlaceholder.svg",
                appParams : {
                    minimizeable: true,
                    maximizeable: false,
                    resizeable: false,
                    sizeDrawMethod: "fit-content",
                    saveDrawParameters: "disabled"
                }
            }
        )

        await displayComponent({
            url:html,
            taskid:task.id,
            container:task.node,
        })

        ini()
    }
}
