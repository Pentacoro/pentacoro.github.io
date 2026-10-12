import File from "../filesystem/file.js"
import ProxyFile from "../filesystem/proxy.js"

export default class Registry {
    constructor(fileRegistryPath, appRegistryPath) {
        this.fileRegistryPath = fileRegistryPath
        this.appRegistryPath = appRegistryPath
    }

    appFile() {
        return File.at(this.appRegistryPath)
    }

    fileFile() {
        return File.at(this.fileRegistryPath)
    }

    generateSessionAppID(used = new Set()) {
        let id
        do {
            id = [...crypto.getRandomValues(new Uint8Array(3))]
                .map(b => b.toString(16).padStart(2, "0"))
                .join("")
        } while (used.has(id))
        used.add(id)
        return id
    }

    issueSessionAppIDs() {
        const data = this.appFile().data
        data.INDEX = {}
        const used = new Set()
        for (const bucket of ["SYSTEM", "STANDALONE"]) {
            const catalog = data[bucket]
            if (!catalog || typeof catalog !== "object") continue
            for (const name of Object.keys(catalog)) {
                if (name === "return") continue
                const id = this.generateSessionAppID(used)
                catalog[name].appID = id
                data.INDEX[id] = { name, bucket, path: { bucket, name } }
            }
        }
    }

    getAllApps() {
        const index = ProxyFile.unwrapProxy(this.appFile().data.INDEX) || {}
        return Object.keys(index).map(appID => ({ appID, ...index[appID] }))
    }

    getFileParams(file) {
        const registryFile = this.fileFile()
        const registryFileEntry = (!ProxyFile.isEmpty(registryFile.data[file.cfg.path]))
            ? registryFile.data[file.cfg.path]
            : null
        if (!registryFileEntry) throw new Error(`File ${file.cfg.path} not found in registry`)
        return ProxyFile.unwrapProxy(registryFileEntry)
    }

    resolveIndex(appID) {
        if (!appID) throw new Error("Application id missing")
        const item = this.appFile().data.INDEX[appID]
        if (ProxyFile.isEmpty(item)) throw new Error(`Application ${appID} not found in registry`)
        return ProxyFile.unwrapProxy(item)
    }

    getAppParams(appID) {
        if (!appID) return null
        const pointer = this.resolveIndex(appID)
        const entry = this.appFile().data[pointer.bucket][pointer.name]
        if (ProxyFile.isEmpty(entry)) throw new Error(`Application ${appID} not found in registry`)
        return ProxyFile.unwrapProxy(entry)
    }

    getAppID(appName) {
        const index = ProxyFile.unwrapProxy(this.appFile().data.INDEX) || {}
        for (const [appID, item] of Object.entries(index)) {
            if (item.name === appName) return appID
        }
        throw new Error(`Application ${appName} not found in registry`)
    }

    tryGetAppID(appName) {
        try {
            return this.getAppID(appName)
        } catch {
            return null
        }
    }

    getAppRegistryPath(appID) {
        return this.resolveIndex(appID)
    }

    getAppIDByLauncher(url) {
        const normalized = (url || "").replace(/^\.\//, "/").replace(/\\/g, "/")
        const data = ProxyFile.unwrapProxy(this.appFile().data) || {}
        for (const bucket of ["SYSTEM", "STANDALONE"]) {
            const catalog = data[bucket]
            if (!catalog || typeof catalog !== "object") continue
            for (const [name, entry] of Object.entries(catalog)) {
                if (!entry || typeof entry !== "object") continue
                const dependents = Array.isArray(entry.launcherDependents) ? entry.launcherDependents : []
                const paths = [entry.launcherScriptFilePath, ...dependents]
                    .filter(path => typeof path === "string" && path.length > 0)
                for (const path of paths) {
                    const catalogPath = path.replace(/^\.\//, "/")
                    if (normalized === catalogPath || normalized.endsWith(catalogPath)) {
                        return entry.appID || null
                    }
                }
            }
        }
        return null
    }
}
