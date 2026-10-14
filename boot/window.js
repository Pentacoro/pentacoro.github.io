import plexos from "./plexos.js"
import Task from "../plexos/lib/classes/system/task.js"
import Window from "../plexos/lib/classes/interface/window.js"
import { landing } from "./state.js"

function prepareWindowLayer() {
    const layer = document.getElementById("windowLayer")
    layer.style.position = "fixed"
    layer.style.inset = "0"
    layer.style.width = "100%"
    layer.style.height = "100%"
    layer.style.pointerEvents = "none"
    return layer
}

export function releaseWindowLayer() {
    const layer = document.getElementById("windowLayer")
    layer.style.position = ""
    layer.style.inset = ""
    layer.style.top = ""
    layer.style.left = ""
    layer.style.width = ""
    layer.style.height = ""
    layer.style.pointerEvents = ""
}

function openLandingWindow() {
    const task = landing.task && Task.id(landing.task.id)
        ? landing.task
        : new Task({
            name: "Landing",
            from: "System",
            node: document.getElementById("windowLayer"),
        })
    landing.task = task
    const layer = prepareWindowLayer()
    landing.window = new Window({
        task: task.id,
        name: "Plexos",
        container: layer,
        appParams: {
            sizeDrawMethod: "window",
            initialDrawSize: [layer.clientWidth || window.innerWidth, layer.clientHeight || window.innerHeight],
            initialDrawPosition: [0, 0],
            saveDrawParameters: "disabled",
            minimizeable: false,
            maximizeable: false,
            resizeable: false,
        },
    })
    landing.window.node.classList.add("landing-window")
    landing.window.node.classList.remove("building")
    landing.window.node.style.pointerEvents = "all"
    landing.window.drawParams.posX = 0
    landing.window.drawParams.posY = 0
    landing.window.poseNode()
    return landing.window
}

export function landingContent() {
    if (!landing.window || !landing.window.node?.isConnected) openLandingWindow()
    return landing.window.keyNodes.content
}

export function bindManagerAppIDs() {
    // These two launched before a registry existed, so /APPID/ never got replaced.
    const managers = [
        ["Theme Manager", "./plexos/app/sys/Theme Manager/themeManager.ls"],
        ["Window Manager", "./plexos/app/sys/Window Manager/windowManager.ls"],
    ]
    for (const [name, url] of managers) {
        const task = Task.get(name)
        const appID = plexos.Core.registry?.getAppIDByLauncher(url)
        if (task && appID) task.appID = appID
    }
}

export function closeLanding() {
    if (landing.window) Window.close(landing.window)
    landing.window = null
    landing.task = null
}
