import { themeConstruct } from "./theme.js"

const behaviours = {
    disclosure(control) {
        const { button, panel } = control.keyNodes
        control.isOpen = () => button.classList.contains("open")
        control.setOpen = (open) => {
            button.classList.toggle("open", open)
            button.classList.toggle("closed", !open)
            panel.style.display = open ? "block" : "none"
        }
        button.addEventListener("click", () => control.setOpen(!control.isOpen()))
    },

    propertySheet(control) {
        const tabs = control.keyNodes.tabs
        control.selected = null
        control.select = (id) => {
            if (!tabs[id]) return
            for (const [key, entry] of Object.entries(tabs)) {
                entry.input.checked = key === id
                entry.panel.classList.toggle("hidden", key !== id)
            }
            control.selected = id
        }
        control.showTab = (id, visible = true) => tabs[id]?.tab.classList.toggle("hidden", !visible)
        control.removeTab = (id) => {
            if (!tabs[id]) return
            tabs[id].tab.remove()
            tabs[id].panel.remove()
            delete tabs[id]
        }
        for (const [id, entry] of Object.entries(tabs)) {
            entry.input.addEventListener("change", () => {
                if (entry.input.checked) control.select(id)
            })
        }
    },
}

export function control(name, options = {}) {
    const kit = themeConstruct("controls")
    if (typeof kit[name] !== "function") throw new Error(`Theme control '${name}' is not available`)
    const built = kit[name](options)
    behaviours[name]?.(built, options)
    return built
}

export function setDisabled(node, disabled) {
    node.disabled = disabled
    node.classList.toggle("disabled", disabled)
}

function readPath(target, path) {
    return path.split(".").reduce((value, key) => value?.[key], target)
}

function writePath(target, path, value) {
    const keys = path.split(".")
    const last = keys.pop()
    const parent = keys.reduce((value, key) => value[key] ??= {}, target)
    parent[last] = value
}

export function bindField(input, { target, path, inverted = false, onChange } = {}) {
    const read = () => readPath(target(), path)
    const write = (value) => {
        writePath(target(), path, value)
        onChange?.()
    }

    if (input.type === "checkbox") {
        input.checked = inverted ? !read() : !!read()
        input.addEventListener("change", () => write(inverted ? !input.checked : input.checked))
        return
    }

    input.value = read() || ""
    input.addEventListener("input", () => write(input.type === "number" ? Number(input.value) : input.value))
}

export function bindAuto(keyNodes, { target, path, autoPath, onChange } = {}) {
    const { input, autoButton, autoCheck } = keyNodes
    bindField(input, {
        target,
        path,
        onChange: () => {
            writePath(target(), autoPath, false)
            autoCheck.checked = false
            onChange?.()
        },
    })

    autoCheck.checked = !!readPath(target(), autoPath)
    autoCheck.addEventListener("change", () => {
        writePath(target(), autoPath, autoCheck.checked)
        onChange?.()
    })

    autoButton.addEventListener("click", () => {
        if (readPath(target(), autoPath)) return
        writePath(target(), autoPath, true)
        onChange?.()
        writePath(target(), autoPath, false)
    })
}

export function wireSheet(sheet, task, { change, apply } = {}) {
    const { accept, cancel, apply: applyButton } = sheet.keyNodes.buttons
    accept.onclick = async () => {
        await apply?.()
        task.end()
    }
    cancel.onclick = () => task.end()
    applyButton.onclick = async () => {
        await apply?.()
        setDisabled(applyButton, true)
    }
    return function changed() {
        change?.()
        if (applyButton.disabled) setDisabled(applyButton, false)
    }
}
