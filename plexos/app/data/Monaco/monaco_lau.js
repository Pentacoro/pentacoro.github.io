import Task from "/plexos/lib/classes/system/task.js"
import Window from "/plexos/lib/classes/interface/window.js"
import File from "/plexos/lib/classes/files/file.js"
import {displayComponent} from "/plexos/lib/functions/dll.js"

export function initialize(){
    let params = /PARAMS/
    let taskid = /TASKID/
    let addr = /ADDR/
    let root = /ROOT/
    let html = root + "/monaco.html"

    //on app init
    function ini() {
        let mem = Task.id(taskid).mem
        mem.arg.file          = File.at(params.addr)
        mem.arg.fileData      = File.at(params.addr).data
        mem.arg.fileExtension = File.at(params.addr).cfg.exte
    }
    //on app end
    function end() {

    }

    //task creation
    let task = new Task(
        {
            name : "Monaco",
            inst : true,
            appEnd : end,
            node : null,
            from : "",
            id   : taskid
        }
    )
    if (!task.id) return

    //window generation
    new Window(
        {
            name : File.at(params.addr).name+" - Monaco",
            task : task.id, 
            resi : true, 
            uiux : [{class:"_", function: ()=>console.log("Minimize")},{class:"O", function: ()=>console.log("Maximize")}], 
            icon : (File.at(params.addr)) ? File.at(params.addr).cfg.icon.imag : "/plexos/res/images/svg/desktopIcons/defaultFile.svg",
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