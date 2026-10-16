function el(tag, className, text) {
    const node = document.createElement(tag)
    if (className) node.className = className
    if (text != null) node.textContent = text
    return node
}

export default {
    panel({ inset = false, className = "" } = {}) {
        const node = el("div", `${inset ? "sys-inset" : "sys-panel"} ${className}`.trim())
        return { node, keyNodes: { body: node } }
    },

    messageBox({ image, title, description, inset = false } = {}) {
        const node = el("div", inset ? "container sys-inset" : "container")
        const imageNode = el("img")
        imageNode.alt = ""
        if (image) imageNode.src = image
        const message = el("div", "message")
        const titleNode = el("h3")
        const descriptionNode = el("p")
        if (title) titleNode.innerHTML = title
        if (description) descriptionNode.innerHTML = description
        message.append(titleNode, descriptionNode)
        node.append(imageNode, message)
        return { node, keyNodes: { image: imageNode, title: titleNode, description: descriptionNode, message } }
    },

    checkList({ checks = [], idPrefix = "check" } = {}) {
        const node = el("form", checks.length ? "config-form popup-checks has-checks" : "config-form popup-checks")
        const inputs = {}
        for (const check of checks) {
            const id = check.id || "check"
            const row = el("span", "config-option")
            const input = el("input")
            input.type = "checkbox"
            input.id = `${idPrefix}_${id}`
            input.checked = !!check.checked
            const label = el("label", null, check.label || id)
            label.htmlFor = input.id
            row.append(input, label)
            node.appendChild(row)
            inputs[id] = input
        }
        return { node, keyNodes: { inputs } }
    },

    buttonRow({ buttons = [], row = false } = {}) {
        const node = el("div", row ? "config-footer row" : "config-footer")
        const nodes = {}
        buttons.forEach((button, index) => {
            const buttonNode = el("button", "sys-button config-footer-button")
            buttonNode.innerHTML = button.label || ""
            if (button.align === "start") buttonNode.classList.add("start")
            if (button.disabled) {
                buttonNode.disabled = true
                buttonNode.classList.add("disabled")
            }
            node.appendChild(buttonNode)
            nodes[button.id ?? index] = buttonNode
        })
        return { node, keyNodes: { buttons: nodes } }
    },

    disclosureButton({ label = "More details" } = {}) {
        const button = el("button", "disclosure-button closed sys-inset")
        button.type = "button"
        const chevron = el("span", "disclosure-chevron", "\u25be")
        const text = el("span", null, label)
        button.append(chevron, text)
        return { node: button, keyNodes: { button, chevron, text } }
    },

    disclosure({ label = "More details" } = {}) {
        const built = this.disclosureButton({ label })
        const node = el("div", "disclosure")
        const panel = el("div", "details")
        panel.style.display = "none"
        node.append(built.node, panel)
        return { node, keyNodes: { button: built.node, chevron: built.keyNodes.chevron, text: built.keyNodes.text, panel } }
    },

    propertySheet({ tabs = [], buttons = [], idPrefix = "sheet" } = {}) {
        const node = el("div", "config-properties sys-panel")
        const bar = el("div", "config-tabs")
        node.appendChild(bar)
        const entries = {}
        for (const tab of tabs) {
            const tabNode = el("label", tab.hidden ? "config-tab hidden" : "config-tab")
            const input = el("input", "tabRadio_input")
            input.type = "radio"
            input.name = `${idPrefix}_tabs`
            input.id = `${idPrefix}_tab_${tab.id}`
            tabNode.htmlFor = input.id
            const box = el("div", "tabRadio_box")
            box.appendChild(el("span", null, tab.label))
            tabNode.append(input, box)
            bar.appendChild(tabNode)

            const panel = el("div", "tabContent sys-inset hidden")
            const form = el("form", "config-form")
            panel.appendChild(form)
            node.appendChild(panel)

            entries[tab.id] = { tab: tabNode, input, panel, body: form }
        }
        const footer = this.buttonRow({ buttons })
        node.appendChild(footer.node)
        return { node, keyNodes: { bar, tabs: entries, buttons: footer.keyNodes.buttons } }
    },

    field({ type = "value", id, label = "", hint, wide, image, min, auto = false, options = [] } = {}) {
        const row = el("span", type === "header" ? "config-option header" : "config-option")
        if (wide) row.classList.add("wide", wide)
        const labelNode = el("label", null, type === "header" ? null : label)
        if (id) labelNode.htmlFor = id
        row.appendChild(labelNode)

        let input
        let imageNode
        if (type === "header") {
            imageNode = el("img")
            imageNode.alt = ""
            if (image) imageNode.src = image
            labelNode.appendChild(imageNode)
            input = el("span")
        } else if (type === "value") {
            input = el("span")
        } else if (type === "textarea") {
            input = el("textarea")
            input.style.resize = "none"
        } else if (type === "select") {
            input = el("select")
            for (const option of options) {
                const optionNode = el("option", null, option.label)
                optionNode.value = option.value
                input.appendChild(optionNode)
            }
        } else {
            input = el("input")
            input.type = type
        }
        if (id) input.id = id
        if (min != null) input.min = min
        if (type === "number") input.pattern = "\\d*"
        row.appendChild(input)

        let autoButton
        let autoCheck
        if (auto) {
            autoButton = el("input", "auto")
            autoButton.type = "button"
            autoButton.value = "Auto"
            autoCheck = el("input", "auto")
            autoCheck.type = "checkbox"
            row.append(autoButton, autoCheck)
        }
        if (hint) row.appendChild(el("span", null, ` ${hint}`))

        return { node: row, keyNodes: { row, label: labelNode, input, image: imageNode, autoButton, autoCheck } }
    },

    heading({ text = "" } = {}) {
        const node = el("div", "h5line")
        const textNode = el("h5", null, text)
        node.append(el("div"), textNode, el("div"))
        return { node, keyNodes: { text: textNode } }
    },

    input({ type = "text", id } = {}) {
        const node = type === "textarea" ? el("textarea") : el("input")
        if (type !== "textarea") node.type = type
        if (id) node.id = id
        return { node, keyNodes: { input: node } }
    },

    text({ id, text = "" } = {}) {
        const node = el("span", null, text)
        if (id) node.id = id
        return { node, keyNodes: { text: node } }
    },

    menubar({ items = [] } = {}) {
        const node = el("div", "menubar_container sys-toolbar")
        const buttons = {}
        for (const name of items) {
            const button = el("button", null, name)
            node.appendChild(button)
            buttons[name] = button
        }
        return { node, keyNodes: { buttons } }
    },

    statusbar() {
        const node = el("div", "statusbar_container sys-toolbar")
        const path = el("span", "status-path")
        const message = el("span", "status-msg")
        node.append(path, message)
        return { node, keyNodes: { path, message } }
    },

    navigationBar() {
        const node = el("div", "nav sys-toolbar")
        const back = el("button", "back", "◀")
        const forward = el("button", "forth", "▶")
        const refresh = el("button", "refresh", "⭮")
        const up = el("button", "parent", "▲")
        back.title = "Back"
        forward.title = "Forward"
        refresh.title = "Refresh"
        up.title = "Up one folder"
        for (const button of [back, forward, refresh, up]) button.type = "button"
        const addressBox = el("div", "addressBox")
        const address = el("input", "address")
        address.type = "text"
        address.spellcheck = false
        address.dataset.readonlySafe = "" // navigating, not writing. A read-only core keeps it usable
        addressBox.appendChild(address)
        node.append(back, forward, refresh, up, addressBox)
        return { node, keyNodes: { back, forward, up, address, refresh } }
    },

    sidePanel() {
        const node = el("div", "sidePanel sys-inset")
        const list = el("div", "sidePanel-list")
        const bottom = el("div", "sidePanel-bottom") // the bin, anchored below the pins
        const resizer = el("div", "sidePanel-resizer") // drag to change the panel's width
        node.append(list, bottom, resizer)
        return { node, keyNodes: { list, bottom, resizer } }
    },

    sidePanelItem({ name, image }) {
        const node = el("div", "sidePanel-item")
        const icon = el("img", "sidePanel-icon")
        icon.src = image || ""
        icon.draggable = false
        const label = el("span", "sidePanel-name", name)
        node.append(icon, label)
        node.title = name
        return { node, keyNodes: { icon, label } }
    },

    fileView() {
        const node = el("div", "background")
        const header = el("div", "detailsHeader") // column titles for the details view
        const list = el("div", "list")
        node.append(header, list)
        return { node, keyNodes: { header, list } }
    },

    fileDialogBar({ id, label = "File name:", value = "", typeLabel = "Type:", types = [], buttons = [] } = {}) {
        const node = el("div", "dialogBar")
        const fields = el("form", "config-form sys-inset")
        const name = this.field({ type: "text", id, label })
        name.keyNodes.input.value = value
        fields.appendChild(name.node)
        let type
        if (types.length) {
            type = this.field({ type: "select", id: id && `${id}_type`, label: typeLabel, options: types })
            fields.appendChild(type.node)
        }
        const footer = this.buttonRow({ buttons })
        footer.node.classList.add("sys-panel")
        node.append(fields, footer.node)
        return { node, keyNodes: { name: name.keyNodes.input, type: type?.keyNodes.input, buttons: footer.keyNodes.buttons } }
    },

    separator() {
        const node = el("hr")
        return { node, keyNodes: {} }
    },
}
