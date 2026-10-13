export default {
    createRoot() {
        const menu = document.createElement("div")
        menu.setAttribute("class", "clickContext sub_0 shadow")
        document.getElementById("contextLayer").appendChild(menu)
        return menu
    },
    createSection() {
        const section = document.createElement("div")
        section.classList.add("contextSection")
        return section
    },
    createOption({ id, name, icon, shortcut, hasChildren }) {
        const button = document.createElement("div")
        button.id = id
        button.classList.add("dropOpt")

        const iconEl = document.createElement("div")
        iconEl.style.backgroundImage = icon
        const textEl = document.createElement("span")
        textEl.innerHTML = name
        button.appendChild(iconEl)
        button.appendChild(textEl)

        if (shortcut) {
            const shortcutEl = document.createElement("span")
            shortcutEl.className = "shortcut"
            shortcutEl.textContent = shortcut
            button.appendChild(shortcutEl)
        }

        if (hasChildren) {
            const chevron = document.createElement("span")
            chevron.setAttribute("class", "last")
            chevron.setAttribute("style", "text-align: right;")
            chevron.innerHTML = "❯"
            button.appendChild(chevron)
        }

        return button
    },
    createSubmenu(depth) {
        const sub = document.createElement("div")
        sub.setAttribute("class", "clickContext sub_" + depth + " subMenu shadow")
        document.getElementById("contextLayer").appendChild(sub)
        return sub
    },
}
