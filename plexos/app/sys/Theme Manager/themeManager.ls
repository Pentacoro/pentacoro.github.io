import plexos from "/plexos/ini/system.js"
import Task from "/plexos/lib/classes/system/task.js"
import {displayComponent} from "/plexos/lib/functions/dll.js"
import {loadThemeConstructors, applyThemeFavicon} from "/plexos/lib/functions/theme.js"

export default {
    app: `Theme Manager`,
    run: async function({taskid,appid,args,path,root}){
        let html = root + "/themeManager.html"

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

        await loadThemeConstructors()
        applyThemeFavicon()
        await displayComponent({
            url:html,
            taskid:task.id,
            container:task.node,
        })
    }
}
