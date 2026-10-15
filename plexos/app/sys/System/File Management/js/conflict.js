import { getTask } from "/plexos/lib/functions/dll.js"
import { control } from "/plexos/lib/functions/controls.js"

const task = getTask(/TASKID/)
const arg = task.mem.arg
const root = task.node.getElementById(task.id + "_root")

const body = control("panel", { inset: true, className: "body-light" })
const box = control("messageBox", {
    title: "",
    description: "",
    image: "/THEME/icons/files/images/folder.svg",
})
box.keyNodes.title.textContent = "File already exists."
box.keyNodes.description.style.whiteSpace = "pre-line"
box.keyNodes.description.textContent = (("The " + arg.folder + " folder") || "This folder") + " already has a file named\n\"" + arg.fileName + "\"."
const form = document.createElement("form")
form.className = "config-form popup-checks has-checks"
const keep = control("field", { type: "checkbox", id: task.id + "_all", label: "Do this for the remaining conflicts" })
keep.node.insertBefore(keep.keyNodes.input, keep.keyNodes.label)
form.appendChild(keep.node)
const row = control("buttonRow", {
    row: true,
    buttons: [
        { id: "replace", label: "Replace" },
        { id: "keep", label: "Keep both" },
        { id: "skip", label: "Skip" },
    ],
})

function choose(action) {
    arg.finish?.({ action, all: keep.keyNodes.input.checked })
    task.end()
}
row.node.classList.add("sys-panel")
row.keyNodes.buttons.replace.onclick = () => choose("replace")
row.keyNodes.buttons.keep.onclick = () => choose("keep")
row.keyNodes.buttons.skip.onclick = () => choose("skip")

body.node.append(box.node, form)
root.append(body.node, row.node)
