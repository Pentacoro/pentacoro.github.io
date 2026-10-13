import plexos from "./system.js"
import {settingsData} from "./config.js"
import Registry from "/plexos/lib/classes/system/registry.js"
import File from "/plexos/lib/classes/filesystem/file.js"
import ProxyFile from "/plexos/lib/classes/filesystem/proxy.js"

const settingsPath = "/plexos/cfg/settings.json"

async function ensureSettingsFile() {
    let file = File.at(settingsPath)
    if (!file) {
        file = await File.create({
            path: "/plexos/cfg",
            Type: "StringFile",
            name: "settings.json",
            content: JSON.stringify(settingsData(), null, 2),
        })
    }
    const stored = JSON.parse(file.data)
    stored.system = stored.system || {}
    stored.system.basePath = window.location
    plexos.Settings = stored
}

export function writeSettingsFile() {
    const file = File.at(settingsPath)
    if (!file || !plexos.Settings?.system) return
    const { basePath, ...system } = plexos.Settings.system
    file.data = JSON.stringify({
        system,
        audio: plexos.Settings.audio,
        desktop: plexos.Settings.desktop,
        apps: plexos.Settings.apps,
    }, null, 2)
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

    plexos.System.ini.openDesktop("/user/desks/desktop")
}
