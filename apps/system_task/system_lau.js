let params = {} //
let taskid = ''
let url = "/apps/system_task/system.html"
let lau = "/apps/system_task/system_lau.html"

//on app init
function ini() {

}
//on app end
function end() {

}

//task creation
let task = new Task(
    {
		name : "System",
		inst : false,
		appEnd : end,
		node : document.getElementById("appLauncher"),
		from : "Plexos",
        id : taskid
	}
)
if (!task.id) return

try {
    let id = task.id

    ini()

    let replacementPairs = []

    dll.displayComponent({
        url:url,
        taskid:id,
        replacementPairs:replacementPairs,
        container:task.node
    })
} catch (e) {
    console.error(e)
    task.end()
}