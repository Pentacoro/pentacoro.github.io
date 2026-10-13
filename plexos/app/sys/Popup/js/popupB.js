import {getTask} from "/plexos/lib/functions/dll.js"
import {control} from "/plexos/lib/functions/controls.js"
let task = getTask(/TASKID/)
let mem  = task.mem
let arg  = mem.arg

const checks = Array.isArray(arg.checks) ? arg.checks : [] // caller-supplied; Permission's Remember is one instance

let buttons = Array.isArray(arg.buttons) ? arg.buttons : null
if (!buttons && arg.taskid) {
    const parentButtons = getTask(arg.taskid)?.mem?.var?.errorB
    if (Array.isArray(parentButtons)) {
        buttons = parentButtons.map(entry => ({
            label: entry[0],
            action: entry[1],
        }))
    }
}
buttons ??= []

const popup   = control("panel", { className: "popup" })
const body    = control("panel", { inset: true, className: "body-light" })
const message = control("messageBox", {
    image: arg.image || "./assets/error-svgrepo-com.svg",
    title: arg.title,
    description: arg.description,
})
const checkList = control("checkList", { checks, idPrefix: task.id + "_check" })
const footer    = control("buttonRow", {
    buttons: buttons.map((button, index) => ({ id: button.id ?? index, label: button.label || button[0] })),
    row: true,
})

body.node.append(message.node, checkList.node)
popup.node.append(body.node, footer.node)
task.node.getElementById(task.id + "_root").appendChild(popup.node)

mem.ui = { message, checkList, footer }

for (const check of checks) {
    const id = check.id || "check"
    const input = checkList.keyNodes.inputs[id]
    if (typeof check.onChange === "function") {
        input.addEventListener("change", () => check.onChange({
            id,
            checked: input.checked,
            check,
        }))
    }
}

function readChecks() {
    const values = {}
    for (const [id, input] of Object.entries(checkList.keyNodes.inputs)) {
        values[id] = input.checked
    }
    return values
}

function runCheckActions(button) {
    const values = readChecks()
    for (const check of checks) {
        if (typeof check.action !== "function") continue
        const id = check.id || "check"
        check.action({
            id,
            checked: !!values[id],
            values,
            button,
            value: button?.value,
        })
    }
    return values
}

buttons.forEach((button, index) => {
    footer.keyNodes.buttons[button.id ?? index].onclick = () => {
        const values = runCheckActions(button)
        if (typeof button.action === "function") button.action({ checks: values, value: button.value, button })
        if (button.close !== false) task.end()
    }
})
