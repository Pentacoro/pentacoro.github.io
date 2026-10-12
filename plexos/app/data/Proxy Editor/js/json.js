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
mem.showJson = function () {
    mem.jsonLoadingEl.classList.remove("hidden")
    mem.treeEl.classList.add("hidden")
    mem.editorEl.classList.remove("behind")
    const text = JSON.stringify(mem.draft, null, 4)
    if (!mem.editor) return
    mem.ignoreJsonChange = true
    if (mem.editor.getValue() !== text) mem.editor.setValue(text)
    mem.editor.getModel()?.updateOptions({ tabSize: 4, indentSize: 4, insertSpaces: true })
    mem.layoutEditor()
    Promise.resolve(mem.foldJson(true)).finally(() => {
        mem.jsonLoadingEl.classList.add("hidden")
        mem.ignoreJsonChange = false
        mem.editor?.focus()
    })
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
            minimap: { enabled: false },
            tabSize: 4,
            indentSize: 4,
            insertSpaces: true,
            detectIndentation: false,
            folding: true,
            foldingStrategy: "indentation",
            showFoldingControls: "always",
        })
        mem.editor.onDidChangeModelContent(() => {
            if (mem.mode !== "json" || mem.ignoreJsonChange) return
            mem.markDirty(true)
            mem.queueJsonHistory()
        })
        new ResizeObserver(() => mem.layoutEditor()).observe(mem.editorEl.parentElement)
        if (mem.mode === "json") mem.showJson()
        else mem.layoutEditor()
    })
}
