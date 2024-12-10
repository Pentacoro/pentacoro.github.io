import Task from "/plexos/lib/classes/system/task.js"
import Window from "/plexos/lib/classes/interface/window.js"
import {displayComponent} from "/plexos/lib/functions/dll.js"

export function initialize(){
    let params = /PARAMS/
    let taskid = /TASKID/
    let addr = /ADDR/
    let root = /ROOT/
    let html = root + "/deskGridOptions.html"

    //on app init
    function ini() {
        task.emit("desktop-grid-settings-open")
    }

    //task creation
    let task = new Task(
        {
            name : "Desktop Grid Settings",
            inst : false,
            node : null,
            from : "plx", 
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
            resi : false, 
            uiux : [], 
            icon : "/plexos/res/images/svg/desktopIcons/settingsPlaceholder.svg",
            stat : 1, 
            widt : 361, 
            heig : 490, 
        }
    )

    displayComponent({
        url:html,
        taskid:task.id,
        container:task.node,
    })

    ini()
}