import plexos from "./system.js"
import Registry from "/plexos/lib/classes/system/registry.js"
import File from "/plexos/lib/classes/filesystem/file.js"
import ProxyFile from "/plexos/lib/classes/filesystem/proxy.js"

export default function initialize() {
    plexos.Core.mem.booting = true
    plexos.Core.registry = new Registry("/plexos/reg/files.proxy", "/plexos/reg/applications.proxy")
    plexos.Core.registry.issueSessionAppIDs()
    plexos.Core.mem.booting = false

    console.log(plexos)
    console.log(plexos.Core.file)
    console.log(ProxyFile.unwrapProxy(File.at("plexos/reg/applications.proxy")))

    plexos.System.ini.openDesktop("/user/desks/desktop")
}
