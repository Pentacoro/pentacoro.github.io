import {plexos} from "./system.js"
import File from "/plexos/lib/classes/filesystem/file.js"
import ProxyFile from "/plexos/lib/classes/filesystem/proxy.js"

export default function initialize() {
    plexos.System.ini.openDesktop("/user/desks/desktop")
    console.log(plexos)
    console.log(plexos.Core.file)

    let proxy = File.at("/plexos/reg/applications.proxy")
    proxy.data = {}
    proxy.data.SYSTEM = {
        "Desktop": {
            installationDirectory: "@/plexos/app/sys/Desktop",
            launcherScriptFilePath: "/plexos/app/sys/Desktop/desktop.ls.js",
            systemPermissions: [
                "file.create",
                "file.modify",
                "file.delete",
                "task.launch",
                "task.listen",
                "task.broadcast",
                "document.access"
            ],
            systemProhibitions: []
        },
        "Explorer": {
            windowDrawParameters: {
                default: {
                    minimizeable: true,
                    maximizeable: true,
                    resizeable: true,
                    sizeDrawMethod: "window",
                    saveDrawParameters: "app"
                },
                current: {}
            },
            installationDirectory: "@/plexos/app/sys/Explorer",
            launcherScriptFilePath: "/plexos/app/sys/Explorer/explorer.ls.js",
            systemPermissions: [
                "file.create",
                "file.modify",
                "file.delete",
                "task.launch",
                "task.listen",
                "task.broadcast"
            ],
            systemProhibitions: []
        },
        "File Properties": {
            windowDrawParameters: {
                default: {
                    resizeable: false,
                    sizeDrawMethod: "fit-content"
                }
            },
            installationDirectory: "@/plexos/app/sys/File Properties",
            launcherScriptFilePath: "/plexos/app/sys/File Properties/prop.ls.js",
            systemPermissions: [
                "file.modify",
                "task.launch",
                "task.listen",
                "task.broadcast"
            ],
            systemProhibitions: []
        },
        "Meta Creator": { //to be reassigned to file proxy
            windowDrawParameters: {
                default: {
                    minimizeable: true,
                    maximizeable: false,
                    resizeable: false,
                    sizeDrawMethod: "fit-content",
                    saveDrawParameters: "disabled"
                }
            },
            installationDirectory: "@/plexos/app/meta/Meta Creator",
            launcherScriptFilePath: "/plexos/app/meta/Meta Creator/metaCreator.ls.js",
            systemPermissions: [
                "file.create",
                "file.modify",
                "file.delete",
                "task.listen",
                "task.broadcast",
            ],
            systemProhibitions: []
        },
        "Popup": { //to be reassigned to file proxy
            windowDrawParameters: {
                default: {
                    minimizeable: false,
                    maximizeable: false,
                    resizeable: false,
                    sizeDrawMethod: "fit-content",
                    saveDrawParameters: "disabled"
                }
            },
            installationDirectory: "@/plexos/app/sys/Popup",
            launcherScriptFilePath: "/plexos/app/sys/Popup/popup.ls.js",
            systemPermissions: [
                "task.launch",
                "task.broadcast"
            ],
            systemProhibitions: []
        },
        "Theme Manager": {
            installationDirectory: "@/plexos/app/sys/Theme Manager",
            launcherScriptFilePath: "/plexos/app/sys/Theme Manager/themeManager.ls.js",
            systemPermissions: [
                "file.create",
                "file.modify",
                "file.delete",
                "task.launch",
                "task.listen",
                "task.broadcast",
                "document.access"
            ],
            systemProhibitions: []
        },
        "Window Manager": {
            installationDirectory: "@/plexos/app/sys/Window Manager",
            launcherScriptFilePath: "/plexos/app/sys/Window Manager/windowManager.ls.js",
            systemPermissions: [
                "file.create",
                "file.modify",
                "file.delete",
                "task.launch",
                "task.listen",
                "task.broadcast",
                "document.access"
            ],
            systemProhibitions: []
        },
    }
    proxy.data.STANDALONE = {
        "Notepad": {
            installationDirectory: "@/plexos/app/data/Notepad",
            launcherScriptFilePath: "/plexos/app/data/Notepad/notepad.ls.js",
            systemPermissions: [
                "file.create",
                "file.modify",
                "task.launch",
                "task.listen",
                "task.broadcast"
            ],
            systemProhibitions: []
        },
        "Web Framer": {
            windowDrawParameters: {
                default: {
                    minimizeable: true,
                    maximizeable: true,
                    resizeable: true,
                    sizeDrawMethod: "window",
                    initialDrawSize: "very-big",
                    initialAspectRatio: [16,9],
                    saveDrawParameters: "file",
                }
            },
            installationDirectory: "@/plexos/app/data/Web Framer",
            launcherScriptFilePath: "/plexos/app/data/Web Framer/iframer.ls.js",
            systemPermissions: [
                "task.listen",
                "task.broadcast"
            ],
            systemProhibitions: []
        },
    }
    console.log(ProxyFile.unwrapProxy(proxy))
}