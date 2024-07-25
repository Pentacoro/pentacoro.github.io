if (dll.getValue("core")) {
    let corePromise = dll.ajaxReturn("GET",dll.getValue("core"))
    corePromise
    .then(data=>{
        if (data.status >= 200 && data.status < 300) throw data
        core = Directory.coreTemplate()
        system.init.recreateFiles(JSON.parse(data),core)
        plexos.vtx = core.dir["vertex"]
    })
    .then(()=>{
        system.init.setVertex("/vertex")
    })
    .catch(()=>{
        let corePromise = system.init.defineCore()
        corePromise
        .then(data=>{
            core = data
            system.init.setVertex("/vertex")
        })
    })
} else {
    let corePromise = system.init.defineCore()
    corePromise
    .then(data=>{
        core = data
        system.init.setVertex("/vertex")
    })
}