let task = Task.openInstance("System")
let system = task
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