import Task from "/plexos/lib/classes/system/task.js"
import Window from "/plexos/lib/classes/interface/window.js"
import {displayComponent} from "/plexos/lib/functions/dll.js"

export function initialize({taskid,args,path,root}){
    let html = root + "/themeManager.html"

    //task creation
    let task = new Task(
        {
            name : "Theme Manager",
            instantiable : false,
            node : document.getElementById("themeLayer"),
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