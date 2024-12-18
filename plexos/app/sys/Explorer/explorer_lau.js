import Task from "/plexos/lib/classes/system/task.js"
import Window from "/plexos/lib/classes/interface/window.js"
import File from "/plexos/lib/classes/files/file.js"
import {displayComponent} from "/plexos/lib/functions/dll.js"

export function initialize() {
    let params = /PARAMS/ //name, addr, type, file
    let taskid = /TASKID/
    let addr = /ADDR/
    let root = /ROOT/
    let html = (params.type) ? root + "/explorer"+params.type+".html" :  root + "/explorer.html"

    //on app init
    function ini() {
        let task = Task.id(taskid)
        let arg  = task.mem.arg

        arg.address = params.addr
    }
    //on app end
    function end() {

    }

    //task creation
    let task = new Task(
        {
            name : "Explorer",
            inst : true,
            onEnd : end,
            node : null,
            from : "Plexus",
            id   : taskid
        }
    )
    if (!task.id) return

    //window generation
    new Window(
        {
            name : params.name,
            task : task.id, 
            resi : true, 
            uiux : [{class:"_", function: ()=>console.log("Minimize")},{class:"O", function: ()=>console.log("Maximize")}], 
            icon : (File.at(params.addr)) ? File.at(params.addr).cfg.icon.imag : "/plexos/res/themes/Plexos Hyper/icons/files/defaultDIR.svg",
            stat : 1, 
            widt : 700, 
            heig : 460, 
            minW : 192,
            minH : 160
        }
    )

    ini()
    
    displayComponent({
        url:html,
        taskid:task.id,
        container:task.node
    })
}