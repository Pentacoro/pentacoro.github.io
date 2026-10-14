import plexos from "/boot/plexos.js"
import Task from "/plexos/lib/classes/system/task.js"
import {applyThemeFace} from "/plexos/lib/functions/theme.js"

export default {
    app: `Theme Manager`,
    run: async function({taskid,appid,args,path,root}){
        plexos.Theme = { ...(plexos.Theme || {}), face: args?.face || plexos.Theme?.face || "landing" }

        let task = new Task(
            {
                appID: /APPID/,
                name : "Theme Manager",
                node : document.getElementById("themeLayer"),
                from : "System",
                id   : taskid
            }
        )
        if (!task.id) return

        await applyThemeFace(plexos.Theme.face)
    }
}
