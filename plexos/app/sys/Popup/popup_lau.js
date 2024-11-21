import Task from "/plexos/lib/classes/system/task.js"
import Window from "/plexos/lib/classes/interface/window.js"
import dll from "/plexos/lib/functions/dll.js"

export function initialize() {
    let params = /PARAMS/
    let taskid = /TASKID/
    let addr = /ADDR/
    let root = /ROOT/
    let html = (params.type) ? root + "/popup.html" : root + "/popupB.html"

    //on app init
    function ini() {

    }
    //on app end
    function end() {

    }

    //task creation
    let task = new Task(
        {
            name : "Popup",
            inst : true,
            appEnd : end,
            node : null,
            from : "System",
            id   : taskid
        }
    )
    if (!task.id) return

    try {
        let id = task.id

        //window generation
        new Window
        (
            {
                name : params.name,
                task : task.id, 
                rezi : false, 
                uiux : [], 
                icon : (params.icon) ? params.icon : null,
                stat : 1, 
                widt : 400, 
                heig : 150, 
                minW : 400,
                minH : 150
            }
        )
            
        ini()

        let replacementPairs = [
            {regex:/arg\[0\]/,text:JSON.stringify(params.name)},
            {regex:/arg\[1\]/,text:JSON.stringify(params.type)},
            {regex:/arg\[2\]/,text:JSON.stringify(params.title)},
            {regex:/arg\[3\]/,text:JSON.stringify(params.description)},
            {regex:/arg\[4\]/,text:JSON.stringify(params.taskid)},
            {regex:/arg\[5\]/,text:JSON.stringify(params.icon)},
        ]

        dll.displayComponent({
            url:html,
            taskid:task.id,
            replacementPairs:replacementPairs,
            container:task.node
        })
    } catch (e) {
        console.error(e)
        console.error(system.mem.var.error)
    }
}