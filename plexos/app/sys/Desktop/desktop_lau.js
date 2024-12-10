import Task from "/plexos/lib/classes/system/task.js"
import {displayComponent} from "/plexos/lib/functions/dll.js"

export function initialize() {
    let params = /PARAMS/
    let taskid = /TASKID/
    let addr = /ADDR/
    let root = /ROOT/
    let html = root + "/desktop.html"

    //on app init
    function ini() {
        let mem = Task.id(taskid).mem
        mem.sfx.push(new Audio("plexos/res/sounds/Norrum - Interfaz Click v1.mp3"))
        mem.sfx.push(new Audio("plexos/res/sounds/Norrum - Interfaz Item errOr v1.mp3"))
        mem.sfx.push(new Audio("plexos/res/sounds/Norrum - Interfaz Item OK c_ v1.mp3"))
        mem.sfx.push(new Audio("plexos/res/sounds/Norrum - Interfaz Item alMost.mp3"))

        mem.arg.address = params.addr
    }
    //on app end
    function end() {}

    //task creation
    let task = new Task(
        {
            name : "Desktop",
            inst : false,
            appEnd : end,
            node : document.getElementById("desktopLayer"),
            from : "Plexus",
            id   : taskid
        }
    )
    if (!task.id) return

    ini()

    displayComponent({
        url:html,
        taskid:task.id,
        container:task.node
    })
}