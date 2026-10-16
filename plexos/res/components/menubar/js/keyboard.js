import plexos from "/boot/plexos.js"
import {getTask} from "/plexos/lib/functions/dll.js"
import ContextMenu from "/plexos/lib/classes/interface/contextmenu.js"

let task = getTask(/TASKID/)
let mem  = task.mem

// Alt on its own (pressed and released with no other key) works the menubar of the focused window, as in Windows.
// The first button lights up. Left/Right move along, Down or Enter open that menu, and while one is open Left/Right
// move to the next menu. Escape, Alt again or a click leave. An app that sets mem.menubar.altHides (Explorer)
// shows and hides its menubar with Alt instead, and hears about it through mem.menubar.onToggle(hidden).
let altAlone = false
let lit = -1
let menuOpen = false

const buttons = () => Object.values(mem.menubar.keyNodes?.buttons || {})
const focused = () => plexos.System.mem.focused === task

function light(index) {
    lit = index
    buttons().forEach((button, at) => button.classList.toggle("keyFocus", at === index))
}

function leave() {
    if (menuOpen) ContextMenu.close()
    menuOpen = false
    light(-1)
}

function openAt(index) {
    const list = buttons()
    if (!list.length) return
    const at = (index + list.length) % list.length
    ContextMenu.close()
    light(at)
    list[at].openMenu?.()
    ContextMenu.focusFirst(0)
    menuOpen = true
}

function toggleHidden() {
    const mount = task.node.getElementById(task.id + "_menubar")
    const strip = mount?.closest(".component_menubar") || mount
    if (!strip) return
    const hidden = strip.classList.toggle("menubarHidden")
    mem.menubar.onToggle?.(hidden) // the app may keep it
}

function onKeyDown(e) {
    if (e.key === "Alt") {
        altAlone = !e.repeat && focused()
        return
    }
    altAlone = false
    if (lit < 0 || !focused()) return
    // the open menu takes its own keys first. Left/Right it doesn't use move to the next menu
    if (menuOpen && !ContextMenu.levels.length) menuOpen = false
    if (menuOpen && ContextMenu.handleKey(e)) {
        e.preventDefault()
        e.stopImmediatePropagation()
        if (!ContextMenu.levels.length) leave()
        return
    }
    const count = buttons().length
    switch (e.key) {
        case "ArrowRight":
        case "ArrowLeft": {
            const next = lit + (e.key === "ArrowRight" ? 1 : -1)
            if (menuOpen) openAt(next)
            else light((next + count) % count)
            break
        }
        case "ArrowDown":
        case "Enter":
            openAt(lit)
            break
        case "Escape":
            leave()
            break
        default:
            return
    }
    e.preventDefault()
    e.stopImmediatePropagation()
}

function onKeyUp(e) {
    if (e.key !== "Alt" || !altAlone) return
    altAlone = false
    e.preventDefault()
    if (mem.menubar.altHides) return toggleHidden()
    if (lit >= 0) leave()
    else light(0)
}

function onMouseDown() {
    altAlone = false
    if (lit >= 0) light(-1)
    menuOpen = false
}

document.addEventListener("keydown", onKeyDown, true)
document.addEventListener("keyup", onKeyUp, true)
document.addEventListener("mousedown", onMouseDown, true)
// An app's own end can refuse to close (unsaved changes), so the keys stay hooked until it really ends
const prevEnd = task.onEnd
task.onEnd = async (...args) => {
    const allow = await prevEnd?.(...args)
    if (allow !== false) {
        document.removeEventListener("keydown", onKeyDown, true)
        document.removeEventListener("keyup", onKeyUp, true)
        document.removeEventListener("mousedown", onMouseDown, true)
    }
    return allow
}
