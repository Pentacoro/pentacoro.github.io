import Task from "/plexos/lib/classes/system/task.js"
import Window from "/plexos/lib/classes/interface/window.js"
import {displayComponent} from "/plexos/lib/functions/dll.js"

export default {
    app: `Test`,
    run: async function({taskid, args, path, root}){
        let html = root + "/test.html

        let task = new Task({
            appID: /APPID/,
            name: "Test",
            onEnd: null,
            node: null,
            id: taskid
        })
        if (!task.id) return

        new Window({
            name: "Test",
            task: taskid,
            appParams: {
                minimizeable: false,
                maximizeable: false,
                resizeable: false,
                sizeDrawMethod: "fit-content",
                initialDrawPosition: "center",
            }
        })

        await displayComponent({
            url: html,
            taskid: task.id,
            container: task.node
        })
    }
}
