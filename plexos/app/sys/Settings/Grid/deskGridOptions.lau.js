import Task from "/plexos/lib/classes/system/task.js"
import Window from "/plexos/lib/classes/interface/window.js"
import {displayComponent} from "/plexos/lib/functions/dll.js"

export function initialize({taskid,args,path,root}){
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

    displayComponent({
        url:html,
        taskid:task.id,
        container:task.node,
    })

    ini()
}