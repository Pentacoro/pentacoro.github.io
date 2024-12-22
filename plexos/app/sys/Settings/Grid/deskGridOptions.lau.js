import Task from "/plexos/lib/classes/system/task.js"
import Window from "/plexos/lib/classes/interface/window.js"
import {displayComponent} from "/plexos/lib/functions/dll.js"

export function initialize({taskid,args,addr,root}){
    let html = root + "/deskGridOptions.html"

    //on app init
    function ini() {
        task.emit("desktop-grid-settings-open")
    }

    //task creation
    let task = new Task(
        {
            name : "Desktop Grid Settings",
            instantiable : false,
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
            resizeable : false, 
            buttons : [], 
            icon : "/plexos/res/themes/Plexos Hyper/icons/files/settingsPlaceholder.svg",
            state : 1, 
        }
    )

    displayComponent({
        url:html,
        taskid:task.id,
        container:task.node,
    })

    ini()
}