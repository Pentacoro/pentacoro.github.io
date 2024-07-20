if (dll.getValue("core")) {
    let corePromise = dll.ajaxReturn("GET",dll.getValue("core"))
    corePromise
    .then(data=>{
        if (data.status >= 200 && data.status < 300) throw data
        core = Directory.coreTemplate()
        recreateFiles(JSON.parse(data),core)
        plexos.vtx = core.cont["vertex"]
    })
    .then(()=>{
        system.init.setVertex("/vertex")
    })
    .catch(()=>{
        core = defineCore()
        system.init.setVertex("/vertex")
    })
} else {
    core = defineCore()
    system.init.setVertex("/vertex")
}