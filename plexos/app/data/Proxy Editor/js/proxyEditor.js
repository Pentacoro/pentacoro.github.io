import {getTask} from "/plexos/lib/functions/dll.js"
import { coreReadOnly } from "/plexos/lib/functions/readOnly.js"

let task = getTask(/TASKID/)
let mem  = task.mem

mem.render = function () {
    if (mem.mode === "json") {
        mem.showJson()
        return
    }
    mem.renderTree()
}
mem.setMode = function (mode) {
    if (mode === mem.mode) return
    mem.mode = mode
    mem.render()
}
// Redraw the open view without losing the reader's place: scroll in the tree, scroll and folds in JSON.
mem.refreshView = function () {
    if (mem.mode === "json") {
        mem.refreshJson()
        return
    }
    const scroll = mem.treeEl.scrollTop
    mem.renderTree()
    mem.treeEl.scrollTop = scroll
}

mem.setCollapsed = function (all) {
    mem.collapsed = new Set()
    if (all) mem.walkCollapse(mem.draft, [])
    if (mem.mode === "json") {
        mem.foldJson(all)
        return
    }
    mem.render()
}

task.window.node.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault()
        if (coreReadOnly()) return
        mem.saveDraft()
    }
})

mem.save = mem.saveDraft
mem.reload = () => { mem.loadDraft(); mem.render() }
mem.addRootKey = () => mem.addChild([])

Object.assign(task.node.style, {
    display: "block",
    position: "relative",
    height: "100%",
    overflow: "hidden",
})

const prevEnd = task.onEnd
task.onEnd = () => {
    mem.editor?.dispose()
    if (prevEnd) prevEnd()
}

mem.initJsonEditor()
mem.loadDraft()
mem.render()
