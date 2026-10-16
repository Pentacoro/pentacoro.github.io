import plexos from "/boot/plexos.js"

// Keyboard shortcuts for a task: shortcut(task, "Ctrl+Shift+Z", action). One fires only while its task is the
// focused one, never while typing in a field (unless { inFields: true }), and goes away when the task ends.
// Ctrl also matches the Mac's Cmd. Keys are named as KeyboardEvent.key gives them ("Z", "ArrowLeft", "Delete");
// digits match the key itself, so Ctrl+Shift+2 works whatever Shift turns the 2 into.

function parse(combo) {
    const parts = combo.split("+").map(part => part.trim())
    const key = parts.pop()
    const mods = new Set(parts.map(part => part.toLowerCase()))
    return { key: key.toLowerCase(), ctrl: mods.has("ctrl"), shift: mods.has("shift"), alt: mods.has("alt") }
}

function keyOf(e) {
    if (/^Digit\d$/.test(e.code)) return e.code.slice(5)
    return String(e.key).toLowerCase()
}

function typing(target) {
    return !!target?.closest?.("input, textarea, select, [contenteditable='true']")
}

export function shortcut(task, combo, action, { inFields = false } = {}) {
    const want = parse(combo)
    const listener = (e) => {
        if (plexos.System.mem.focused !== task) return
        if (!inFields && typing(e.target)) return
        if ((e.ctrlKey || e.metaKey) !== want.ctrl || e.shiftKey !== want.shift || e.altKey !== want.alt) return
        if (keyOf(e) !== want.key) return
        e.preventDefault()
        action(e)
    }
    document.addEventListener("keydown", listener)
    task.addCleanup(() => document.removeEventListener("keydown", listener))
}
