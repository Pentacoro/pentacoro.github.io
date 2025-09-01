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
            launcherScriptFilePath: "/plexos/app/sys/Desktop/desktop.ls",
            systemPermissions: [
                "file.access",
                "file.create",
                "file.update",
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
            },
            installationDirectory: "@/plexos/app/sys/Explorer",
            launcherScriptFilePath: "/plexos/app/sys/Explorer/explorer.ls",
            systemPermissions: [
                "file.access",
                "file.create",
                "file.update",
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
            launcherScriptFilePath: "/plexos/app/sys/File Properties/prop.ls",
            systemPermissions: [
                "file.access",
                "file.update",
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
            launcherScriptFilePath: "/plexos/app/meta/Meta Creator/metaCreator.ls",
            systemPermissions: [
                "file.access",
                "file.create",
                "file.update",
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
            launcherScriptFilePath: "/plexos/app/sys/Popup/popup.ls",
            systemPermissions: [
                "task.launch",
                "task.broadcast"
            ],
            systemProhibitions: []
        },
        "Theme Manager": {
            installationDirectory: "@/plexos/app/sys/Theme Manager",
            launcherScriptFilePath: "/plexos/app/sys/Theme Manager/themeManager.ls",
            systemPermissions: [
                "file.access",
                "file.create",
                "file.update",
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
            launcherScriptFilePath: "/plexos/app/sys/Window Manager/windowManager.ls",
            systemPermissions: [
                "file.access",
                "file.create",
                "file.update",
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
            windowDrawParameters: {
                default: {
                    minimizeable: true,
                    maximizeable: true,
                    resizeable: true,
                    sizeDrawMethod: "window",
                    saveDrawParameters: "app"
                }
            },
            installationDirectory: "@/plexos/app/data/Notepad",
            launcherScriptFilePath: "/plexos/app/data/Notepad/notepad.ls",
            systemPermissions: [
                "file.access",
                "file.create",
                "file.update",
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
                    initialAspectRatio: "container",
                    saveDrawParameters: "file",
                }
            },
            installationDirectory: "@/plexos/app/data/Web Framer",
            launcherScriptFilePath: "/plexos/app/data/Web Framer/iframer.ls",
            systemPermissions: [
                "file.access",
                "task.listen",
                "task.broadcast"
            ],
            systemProhibitions: []
        },
    }
    proxy.data = ProxyFile.convertToProxyModel(proxy.data,proxy)
}