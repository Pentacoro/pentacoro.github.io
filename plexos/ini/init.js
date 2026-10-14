import plexos from "../../boot/plexos.js"
import Registry from "/plexos/lib/classes/system/registry.js"
import File from "/plexos/lib/classes/filesystem/file.js"
import ProxyFile from "/plexos/lib/classes/filesystem/proxy.js"
import Task from "/plexos/lib/classes/system/task.js"
import {runLauncher} from "/plexos/lib/functions/dll.js"

const settingsPath = "/plexos/cfg/settings.json"

async function ensureSettingsFile() {
    const file = File.at(settingsPath)
    if (!file?.data) throw new Error("This core has no settings.json")
    plexos.Settings = JSON.parse(file.data)
}

export function writeSettingsFile() {
    const file = File.at(settingsPath)
    if (!file || !plexos.Settings?.system) return
    file.data = JSON.stringify({
        system: plexos.Settings.system,
        audio: plexos.Settings.audio,
        desktop: plexos.Settings.desktop,
        apps: plexos.Settings.apps,
    }, null, 2)
}

export async function openDesktop(address) {
    await runLauncher("./plexos/app/sys/Desktop/desktop.ls", {path: address})
    let desktop = Task.get("Desktop")
    if (desktop?.mem?.grid?.evaluateIconGrid) {
        desktop.mem.grid.evaluateIconGrid()
        desktop.mem.renderIcons()
    }
}

export default async function initialize() {
    plexos.Core.mem.booting = true
    await ensureSettingsFile()
    plexos.Core.registry = new Registry("/plexos/reg/files.proxy", "/plexos/reg/applications.proxy")
    plexos.Core.registry.issueSessionAppIDs()
    plexos.Core.mem.booting = false

    console.log(plexos)
    console.log(plexos.Core.file)
    console.log(ProxyFile.unwrapProxy(File.at("plexos/reg/applications.proxy")))
}
