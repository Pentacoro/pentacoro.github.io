import plexos from "../../boot/plexos.js"
import { coreReadOnly } from "../lib/functions/readOnly.js"

window.addEventListener("paste", async e => {
    if (coreReadOnly()) {
        e.preventDefault()
        return
    }
    let task = plexos.System.mem.focused
	if (task && task.onpaste) task.onpaste(e)
})