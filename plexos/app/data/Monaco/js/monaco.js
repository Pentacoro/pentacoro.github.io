import Task from "/plexos/lib/classes/system/task.js"
import File from "/plexos/lib/classes/files/file.js"

let task = Task.id("TASKID")
let mem  = task.mem

task.apps = ""
mem.fileAddress = "ARG_FILEADDR"
mem.fileData = ARG_TEXTDATA
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

require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@latest/min/vs' } })
window.MonacoEnvironment = { getWorkerUrl: () => proxy }

let proxy = URL.createObjectURL(new Blob([`
	self.MonacoEnvironment = {
		baseUrl: 'https://unpkg.com/monaco-editor@latest/min/'
	};
	importScripts('https://unpkg.com/monaco-editor@latest/min/vs/base/worker/workerMain.js');
`], { type: 'text/javascript' }))

require(["vs/editor/editor.main"], function () {
	let extension = File.at("ARG_FILEADDR").cfg.exte
	mem.editor = monaco.editor.create(task.node.getElementsByClassName('editor')[0], {
		value: mem.fileData,
		language: setLanguage(extension),
		fontFamily: "Fira Mono, DejaVu Sans Mono, Menlo, Consolas, Liberation Mono, Monaco, Lucida Console, monospace",
		fontSize: "12px",
		theme: 'vs-dark',
		automaticLayout: true,
	})

	mem.editor.focus()
	mem.selectionRange = window.getSelection().getRangeAt(0)
	task.window.node.onfocus = e => {
		mem.editor.focus()
		task.node.getElementsByClassName("editor ID_TASKID")[0]?.children[0]?.classList.add("focused")
		task.node.getElementsByClassName("editor ID_TASKID")[0]?.getElementsByClassName("view-overlays")[0]?.classList.add("focused")
	}
	task.window.node.onblur = e => {
		task.node.getElementsByClassName("editor ID_TASKID")[0]?.children[0]?.classList.remove("focused")
		task.node.getElementsByClassName("editor ID_TASKID")[0]?.getElementsByClassName("view-overlays focused")[0]?.classList.remove("focused")
	}
})
Task.id("TASKID").appEnd = e => {
	mem.editor.dispose()
}