import {getTask} from "/plexos/lib/functions/dll.js"
let task = getTask(/TASKID/)
let mem  = task.mem
let arg  = mem.arg

if (arg.title       != "") task.node.getElementsByClassName("message")[0].children[0].innerHTML = arg.title
if (arg.description != "") task.node.getElementsByClassName("message")[0].children[1].innerHTML = arg.description
if (arg.image            ) task.node.getElementsByClassName("container")[0].querySelector("img")?.setAttribute("src", arg.image)

const checksNode = task.node.getElementsByClassName("popup-checks")[0]
const checks = Array.isArray(arg.checks) ? arg.checks : [] // caller-supplied; Permission's Remember is one instance
if (checksNode && checks.length) {
    checksNode.classList.add("has-checks")
    for (const check of checks) {
        const id = check.id || "check"
        const inputId = `/TASKID/_check_${id}`
        const row = document.createElement("span")
        row.setAttribute("class", "config-option")
        const input = document.createElement("input")
        input.type = "checkbox"
        input.id = inputId
        input.className = "popup-check"
        input.dataset.id = id
        input.checked = !!check.checked
        const label = document.createElement("label")
        label.setAttribute("for", inputId)
        label.textContent = check.label || id
        row.appendChild(input)
        row.appendChild(label)
        checksNode.appendChild(row)
        if (typeof check.onChange === "function") {
            input.addEventListener("change", () => check.onChange({
                id,
                checked: input.checked,
                check,
            }))
        }
    }
}

function readChecks() {
    const values = {}
    for (const input of task.node.querySelectorAll("input.popup-check")) {
        values[input.dataset.id] = input.checked
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

if (buttons?.length) {
    const footer = task.node.getElementsByClassName("config-footer")[0]
    for (const button of buttons) {
        const newButton = document.createElement("button")
        newButton.setAttribute("class", "config-footer-button")
        newButton.innerHTML = button.label || button[0] || ""
        footer.appendChild(newButton)
        newButton.onclick = () => {
            const values = runCheckActions(button)
            if (typeof button.action === "function") button.action({ checks: values, value: button.value, button })
            if (button.close !== false) task.end()
        }
    }
}
