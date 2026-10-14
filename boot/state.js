// Nodes the landing pieces share. Assignments stay on this object so every file sees them.
export const landing = {
    task: null,
    window: null,
    mounting: false,
    stage: null,
    usersRow: null,
    logon: null,
    formPanel: null,
    popup: null,
    creatingUser: false,
    addingCore: false,
    slideToken: 0,
    logonReveal: 0,
}

export function el(tag, className, text) {
    const node = document.createElement(tag)
    if (className) node.className = className
    if (text != null) node.textContent = text
    return node
}

export function uniqueName(base, names) {
    if (!names.includes(base)) return base
    let n = 2
    while (names.includes(`${base} ${n}`)) n++
    return `${base} ${n}`
}
