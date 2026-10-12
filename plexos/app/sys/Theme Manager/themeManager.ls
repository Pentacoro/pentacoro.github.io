import Task from "/plexos/lib/classes/system/task.js"
import Window from "/plexos/lib/classes/interface/window.js"
import {displayComponent} from "/plexos/lib/functions/dll.js"

export default {
    app: `Theme Manager`,
    run: async function({taskid,appid,args,path,root}){
        let html = root + "/themeManager.html"

        //task creation
        let task = new Task(
            {
                registryPath: `SYSTEM["Theme Manager"]`,
                name : "Theme Manager",
                node : document.getElementById("themeLayer"),
                from : "System", 
                id   : taskid
            }
        )
        if (!task.id) return

        await displayComponent({
            url:html,
            taskid:task.id,
            container:task.node,
        })
    }
}