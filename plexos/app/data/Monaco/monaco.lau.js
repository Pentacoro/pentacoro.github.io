import Task from "/plexos/lib/classes/system/task.js"
import Window from "/plexos/lib/classes/interface/window.js"
import File from "/plexos/lib/classes/files/file.js"
import {displayComponent} from "/plexos/lib/functions/dll.js"

export function initialize({taskid,args,addr,root}){
    let html = root + "/monaco.html"

    //on app init
    function ini() {
        let mem = Task.id(taskid).mem
        mem.arg.file          = File.at(args.addr)
        mem.arg.fileData      = File.at(args.addr).data
        mem.arg.fileExtension = File.at(args.addr).cfg.exte
    }
    //on app end
    function end() {

    }

    //task creation
    let task = new Task(
        {
            name : "Monaco",
            inst : true,
            onEnd : end,
            node : null,
            from : "",
            id   : taskid
        }
    )
    if (!task.id) return

    //window generation
    new Window(
        {
            name : File.at(args.addr).name+" - Monaco",
            task : task.id, 
            resi : true, 
            uiux : [{class:"_", function: ()=>console.log("Minimize")},{class:"O", function: ()=>console.log("Maximize")}], 
            icon : (File.at(args.addr)) ? File.at(args.addr).cfg.icon.imag : "/plexos/res/themes/Plexos Hyper/icons/files/defaultFile.svg",
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