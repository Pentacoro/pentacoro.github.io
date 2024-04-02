const system = new Task(
    {
		name : "system",
		inst : false,
		appEnd : null,
		node : null,
		from : "sys"
	}
)

system.mem.lau = {}
system.mem.var.dragging = false
system.mem.var.shSelect = true
system.mem.var.envfocus = null
system.mem.focus = function (env) {
    if (system.mem.var.envfocus && env != system.mem.var.envfocus){
        system.mem.var.envfocus.blur()
    }
    system.mem.var.envfocus = env
    system.mem.var.envfocus.focus()
}

plexos.vtx = core.cont["vertex"]

let promiseInit = new Promise(async () => {
    await jsc.runLauncher("./apps/filesystem_desktop/desktop_lau.js",{addr:"/vertex"})
})
promiseInit.then( () => {
    Task.openInstance("Desktop").mem.grid.evaluateIconGrid()
    Task.openInstance("Desktop").mem.renderIcons()
})