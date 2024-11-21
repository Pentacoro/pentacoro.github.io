import Task from "/plexos/lib/classes/system/task.js"
import Window from "/plexos/lib/classes/interface/window.js"
import File from "/plexos/lib/classes/files/file.js"
import dll from "/plexos/lib/functions/dll.js"

export function initialize(){
    let params = /PARAMS/
    let taskid = /TASKID/
    let addr = /ADDR/
    let root = /ROOT/
    let html = root + "/iframer.html"

    //on app init
    function ini() {

    }
    //on app end
    function end() {

    }

    //task creation
    let task = new Task(
        {
            name : "Iframer",
            inst : true,
            appEnd : end,
            node : null,
            from : "Plexus",
            id   : taskid
        }
    )
    if (!task.id) return

    //window generation
    new Window
    (
        {
            name : params.name,
            task : task.id, 
            resi : true, 
            uiux : [{class:"_", function: ()=>console.log("Minimize")},{class:"O", function: ()=>console.log("Maximize")}], 
            icon : (File.at(params.addr)) ? File.at(params.addr).cfg.icon.imag : "/plexos/res/images/svg/desktopIcons/defaultMSF.svg",
            stat : 1, 
            widt : 850, 
            heig : 650, 
            minW : 192,
            minH : 160
        }
    )

    ini()

    let replacementPairs = [
        {regex:/arg\[0\]/,text:JSON.stringify(params.name)},
        {regex:/arg\[1\]/,text:JSON.stringify(params.addr)},
    ]

    dll.displayComponent({
        url:html,
        taskid:task.id,
        replacementPairs:replacementPairs,
        container:task.node
    })
}
