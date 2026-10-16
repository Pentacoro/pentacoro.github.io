import {getTask} from "/plexos/lib/functions/dll.js"

let task = getTask(/TASKID/)
let mem  = task.mem

mem.layoutEditor = function () {
    if (!mem.editor) return
    mem.editor.layout()
    requestAnimationFrame(() => mem.editor?.layout())
}
mem.foldJson = async function (all) {
    const editor = mem.editor
    if (!editor) return
    const run = (id) => Promise.resolve(editor.getAction(id)?.run())
    if (!all) {
        await run("editor.unfoldAll")
        return
    }
    for (let level = 7; level >= 2; level--) {
        await run("editor.foldLevel" + level)
    }
}
// The JSON view only shows the draft. Edits happen in the tree.
mem.showJson = function () {
    mem.jsonLoadingEl.classList.remove("hidden")
    mem.treeEl.classList.add("hidden")
    mem.editorEl.classList.remove("behind")
    const text = JSON.stringify(mem.draft, null, 4)
    if (!mem.editor) return
    if (mem.editor.getValue() !== text) mem.editor.setValue(text)
    mem.editor.getModel()?.updateOptions({ tabSize: 4, indentSize: 4, insertSpaces: true })
    mem.layoutEditor()
    Promise.resolve(mem.foldJson(true)).finally(() => {
        mem.jsonLoadingEl.classList.add("hidden")
        mem.editor?.focus()
    })
}
// Patches only the lines between the unchanged top and bottom. Replacing all the text would drop every fold.
mem.refreshJson = function () {
    const model = mem.editor?.getModel()
    if (!model) return
    const next = JSON.stringify(mem.draft, null, 4).split("\n")
    const prev = model.getLinesContent()
    let top = 0
    while (top < prev.length && top < next.length && prev[top] === next[top]) top++
    if (top === prev.length && top === next.length) return
    let bottom = 0
    while (
        bottom < prev.length - top && bottom < next.length - top &&
        prev[prev.length - 1 - bottom] === next[next.length - 1 - bottom]
    ) bottom++
    const count = prev.length
    const lastOld = count - bottom
    const middle = next.slice(top, next.length - bottom)
    let range, text
    if (lastOld < count) {
        // A kept line follows, so whole lines are swapped, line breaks included
        range = new monaco.Range(top + 1, 1, lastOld + 1, 1)
        text = middle.map(line => line + "\n").join("")
    } else if (top < count) {
        range = new monaco.Range(top + 1, 1, count, model.getLineMaxColumn(count))
        text = middle.join("\n")
    } else {
        range = new monaco.Range(count, model.getLineMaxColumn(count), count, model.getLineMaxColumn(count))
        text = "\n" + middle.join("\n")
    }
    model.applyEdits([{ range, text }])
}
mem.initJsonEditor = function () {
    const monacoBase = "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min"
    require.config({ paths: { vs: monacoBase + "/vs" } })
    window.MonacoEnvironment = { getWorkerUrl: () => monacoWorker }
    const monacoWorker = URL.createObjectURL(new Blob([`
        self.MonacoEnvironment = { baseUrl: "${monacoBase}/" };
        importScripts("${monacoBase}/vs/base/worker/workerMain.js");
    `], { type: "text/javascript" }))
    task.blobList.push(monacoWorker)

    require(["vs/editor/editor.main"], function () {
        mem.editor = monaco.editor.create(mem.editorEl, {
            value: "{}",
            language: "json",
            fontFamily: "Fira Mono, DejaVu Sans Mono, Menlo, Consolas, Liberation Mono, Monaco, Lucida Console, monospace",
            fontSize: "12px",
            theme: "vs-dark",
            automaticLayout: true,
            readOnly: true,
            domReadOnly: true,
            minimap: { enabled: false },
            tabSize: 4,
            indentSize: 4,
            insertSpaces: true,
            detectIndentation: false,
            folding: true,
            foldingStrategy: "indentation",
            showFoldingControls: "always",
        })
        new ResizeObserver(() => mem.layoutEditor()).observe(mem.editorEl.parentElement)
        if (mem.mode === "json") mem.showJson()
        else mem.layoutEditor()
    })
}
