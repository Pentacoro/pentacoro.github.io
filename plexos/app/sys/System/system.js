import plexos from "/boot/plexos.js"
import ProxyFile from "/plexos/lib/classes/filesystem/proxy.js"

// Popup launches from its own folder but runs under System's id, as the File Management windows do.
// A launcher listed in launcherDependents gets that id from Registry.getAppIDByLauncher.
const definition = {
    installationDirectory: "@/plexos/app/sys/System",
    launcherScriptFilePath: "/plexos/app/sys/System/system.ls",
    launcherDependents: ["/plexos/app/sys/System/Popup/popup.ls"],
    instantiable: false,
    systemPermissions: ["file", "task", "event", "document.access"],
    systemProhibitions: [],
}

// The System catalog entry every core needs. Fills it in when missing, adds any dependent an older core lacks,
// and drops the separate Popup entry older cores carry, since Popup is part of System now.
export function ensureSystemEntry(data) {
    const entry = data.SYSTEM.System
    if (ProxyFile.isEmpty(entry)) {
        for (const [key, value] of Object.entries(definition)) entry[key] = value
    }
    const listed = ProxyFile.unwrapProxy(entry.launcherDependents)
    const dependents = Array.isArray(listed) ? listed : []
    const missing = definition.launcherDependents.filter(path => !dependents.includes(path))
    if (missing.length) entry.launcherDependents = [...dependents, ...missing]
    if ("Popup" in data.SYSTEM) delete data.SYSTEM.Popup
}

// The boot task exists before the registry. Give it the System catalog id, creating the entry when a core has none.
export function ensureSystemApp() {
    const registry = plexos.Core?.registry
    const system = plexos.System
    if (!registry || !system) return null
    const data = registry.appFile()?.data
    if (!data) return null

    ensureSystemEntry(data)
    if (!registry.tryGetAppID("System")) {
        const used = new Set(Object.keys(ProxyFile.unwrapProxy(data.INDEX) || {}))
        const id = registry.generateSessionAppID(used)
        data.INDEX[id] = { name: "System", bucket: "SYSTEM" }
    }
    const id = registry.tryGetAppID("System")
    if (id) system.appID = id
    return id
}
