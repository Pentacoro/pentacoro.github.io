import {getTask} from "/plexos/lib/functions/dll.js"

let task = getTask(/TASKID/)
let mem  = task.mem

task.apps = ""
mem.var = {}
mem.var.continuousContext = false

function setLanguage(ext) {
	switch (ext) {
		case "js": {
			return "javascript"
		}
		default: {
			return ext
		}
	}
}

const monacoBase = "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min"
require.config({ paths: { 'vs': monacoBase + "/vs" } })
window.MonacoEnvironment = { getWorkerUrl: () => proxy }

let proxy = URL.createObjectURL(new Blob([`
	self.MonacoEnvironment = {
		baseUrl: '${monacoBase}/'
	};
	importScripts('${monacoBase}/vs/base/worker/workerMain.js');
`], { type: 'text/javascript' }))

require(["vs/editor/editor.main"], function () {
	mem.editor = monaco.editor.create(task.node.getElementsByClassName('editor')[0], {
		value: mem.arg.fileData,
		language: setLanguage(mem.arg.fileExtension),
		fontFamily: "Fira Mono, DejaVu Sans Mono, Menlo, Consolas, Liberation Mono, Monaco, Lucida Console, monospace",
		fontSize: "12px",
		theme: 'vs-dark',
		automaticLayout: true,
	})

	mem.editor.focus()
	mem.selectionRange = window.getSelection().getRangeAt(0)
	task.window.node.onfocus = e => {
		mem.editor.focus()
		task.node.getElementsByClassName("editor")[0]?.children[0]?.classList.add("focused")
		task.node.getElementsByClassName("editor")[0]?.getElementsByClassName("view-overlays")[0]?.classList.add("focused")
	}
	task.window.node.onblur = e => {
		task.node.getElementsByClassName("editor")[0]?.children[0]?.classList.remove("focused")
		task.node.getElementsByClassName("editor")[0]?.getElementsByClassName("view-overlays focused")[0]?.classList.remove("focused")
	}
})
task.onEnd = e => {
	mem.editor.dispose()
}