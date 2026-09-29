import plexos from "../../../ini/system.js"
import { genRanHex } from "../../functions/dll.js"
import File from "./file"
import ProxyFile from "../filesystem/proxy"

export default class Registry {
    constructor(fileRegistryPath, appRegistryPath) {
        this.fileRegistryPath = fileRegistryPath
        this.appRegistryPath = appRegistryPath
    }
    static getAllApps() {
        const registryFile = File.at(this.appRegistryPath)
        const registryAppIndex = ProxyFile.unwrapProxy(registryFile.data.INDEX)
        return Object.keys(registryAppIndex).map(appID => registryAppIndex[appID])
    }
    static getFileParams(file) {
        const registryFile = File.at(this.fileRegistryPath)
        const registryFileEntry = (!ProxyFile.isEmpty(registryFile.data[file.cfg.path])) ? registryFile.data[file.cfg.path] : null
        if (!registryFileEntry) throw new Error(`File ${file.cfg.path} not found in registry`)
        return ProxyFile.unwrapProxy(registryFileEntry)
    }
    static getAppParams(appID) {
        const registryFile = File.at(this.appRegistryPath)
        const registryAppEntry = (!ProxyFile.isEmpty(registryFile.data[appID])) ? registryFile.data[appID] : null
        if (!registryAppEntry) throw new Error(`Application ${appID} not found in registry`)
        return ProxyFile.unwrapProxy(registryAppEntry)
    }
    static getAppID(appName) {
        const registryFile = File.at(this.appRegistryPath)
        const registryAppIndex = ProxyFile.unwrapProxy(registryFile.data.INDEX)
        for (let appID in Object.keys(registryAppIndex)) {
            if (registryAppIndex[appID].name === appName) return appID
        }
        throw new Error(`Application ${appName} not found in registry`)
    }
    static getAppRegistryPath(appID) {
        const registryFile = File.at(this.appRegistryPath)
        const registryAppIndexItem = (!ProxyFile.isEmpty(registryFile.data.INDEX[appID])) ? registryFile.data.INDEX[appID] : null
        if (!registryAppIndexItem) throw new Error(`Application ${appID} not found in registry`)
        return ProxyFile.unwrapProxy(registryAppIndexItem).path
    }
}