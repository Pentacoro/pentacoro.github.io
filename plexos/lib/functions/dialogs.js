import Task from "../classes/system/task.js"
import {runLauncher} from "./dll.js"
import {themeRoot} from "./theme.js"

export function fileDialog({ mode = "open", path, fileName = "", types = [], title, parentTaskId } = {}) {
    const start = path ?? Task.get("Desktop")?.mem?.dirObject?.cfg?.path ?? ""
    const name = title || ((mode === "save") ? "Save As" : "Open")
    const parent = parentTaskId ? Task.id(parentTaskId) : null

    return new Promise((resolve) => {
        if (parent?.persistentWindow) {
            parent.persistentWindow({
                name,
                app: "Explorer",
                url: "/plexos/app/sys/Explorer/explorer.html",
                icon: `${themeRoot()}/icons/files/defaultDIR.svg`,
                args: { address: start, mode, fileName, types, onResult: resolve },
                appParams: {
                    sizeDrawMethod: "window",
                    initialDrawSize: "mid",
                    resizeable: true,
                    saveDrawParameters: "window",
                    windowKey: `fileDialog:${parent.name}`,
                },
            }).then(win => { if (!win) resolve(null) })
            return
        }
        runLauncher("/plexos/app/sys/Explorer/explorer.ls", {
            name,
            path: start,
            mode,
            fileName,
            types,
            onResult: resolve,
        })
    })
}
