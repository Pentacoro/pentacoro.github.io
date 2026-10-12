import Task from "/plexos/lib/classes/system/task.js"
import {displayComponent} from "/plexos/lib/functions/dll.js"

export default {
    app: `Desktop`,
    run: async function({taskid,appid,args,path,root}){
        let html = root + "/desktop.html"

        //on app init
        function ini() {
            let mem = Task.id(taskid).mem
            mem.sfx.push(new Audio("plexos/res/sounds/Norrum - Interfaz Click v1.mp3"))
            mem.sfx.push(new Audio("plexos/res/sounds/Norrum - Interfaz Item errOr v1.mp3"))
            mem.sfx.push(new Audio("plexos/res/sounds/Norrum - Interfaz Item OK c_ v1.mp3"))
            mem.sfx.push(new Audio("plexos/res/sounds/Norrum - Interfaz Item alMost.mp3"))

            mem.arg.address = args.path
        }
        //on app end
        function end() {}

        //task creation
        let task = new Task(
            {
                registryPath: `SYSTEM["Desktop"]`,
                appID: appid,
                name : "Desktop",
                onEnd : end,
                node : document.getElementById("desktopLayer"),
                id   : taskid
            }
        )
        if (!task.id) return

        ini()

        await displayComponent({
            url:html,
            taskid:task.id,
            container:task.node
        })
    }
}