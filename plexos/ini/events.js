import plexos from "../../boot/plexos.js"

window.addEventListener("paste", async e => {
    let task = plexos.System.mem.focused
	if (task && task.onpaste) task.onpaste(e)
})