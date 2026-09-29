import Task from "/plexos/lib/classes/system/task.js"
import Window from "/plexos/lib/classes/interface/window.js"
import {displayComponent} from "/plexos/lib/functions/dll.js"

export default {
    app: `Window Manager`,
    run: function({taskid,appid,args,path,root}){
        let html = root + "/windowManager.html"

        //task creation
        let task = new Task(
            {
                registryPath: `SYSTEM["Window Manager"]`,
                name : "Window Manager",
                node : document.getElementById("windowLayer"),
                from : "System", 
                id   : taskid
            }
        )
        if (!task.id) return

        displayComponent({
            url:html,
            taskid:task.id,
            container:task.node,
        })
    }
}