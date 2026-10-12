import {getTask} from "/plexos/lib/functions/dll.js"

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
    if (mem.mode === "json" && !mem.flushJsonHistory()) return
    mem.mode = mode
    mem.render()
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
