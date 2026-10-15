import plexos from "/boot/plexos.js"
import ProxyFile from "/plexos/lib/classes/filesystem/proxy.js"

const definition = {
    installationDirectory: "@/plexos/app/sys/System",
    launcherScriptFilePath: "/plexos/app/sys/System/system.ls",
    instantiable: false,
    systemPermissions: ["file", "task", "event", "document.access"],
    systemProhibitions: [],
}

// The boot task exists before the registry. Give it the System catalog id, creating the entry when a core has none.
export function ensureSystemApp() {
    const registry = plexos.Core?.registry
    const system = plexos.System
    if (!registry || !system) return null
    const data = registry.appFile()?.data
    if (!data) return null

    const entry = data.SYSTEM.System
    if (ProxyFile.isEmpty(entry)) {
        for (const [key, value] of Object.entries(definition)) entry[key] = value
    }
    if (!registry.tryGetAppID("System")) {
        const used = new Set(Object.keys(ProxyFile.unwrapProxy(data.INDEX) || {}))
        const id = registry.generateSessionAppID(used)
        data.INDEX[id] = { name: "System", bucket: "SYSTEM" }
    }
    const id = registry.tryGetAppID("System")
    if (id) system.appID = id
    return id
}
