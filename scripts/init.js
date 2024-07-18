let corePromise = jsc.ajaxReturn("GET","/core.json")
corePromise
.then(data=>{
    if (data.status >= 200 && data.status < 300) throw data
    core = new Directory(
        {
            name : "core",
            conf : new Configuration (
            {
                icon : new Icon ({imag:"assets/svg/desktopIcons/vertexPH.svg", name:"core", type:"Directory", stat:0}),
                from : "",
                type : "Directory",
                vert : true,
                move : false
            })
        }
    )
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