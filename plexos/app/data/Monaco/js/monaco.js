import {getTask} from "/plexos/lib/functions/dll.js"
import { coreReadOnly } from "/plexos/lib/functions/readOnly.js"
import { fileDialog } from "/plexos/lib/functions/dialogs.js"
import File from "/plexos/lib/classes/filesystem/file.js"

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
		readOnly: coreReadOnly(),
		domReadOnly: coreReadOnly(),
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
// The file isn't held, so it may have been moved, renamed or deleted since it was opened. Then Save asks where.
mem.save = async function () {
	if (coreReadOnly() || !mem.editor) return false
	const data = mem.editor.getValue()
	if (File.at(mem.arg.fileAddr)) {
		return !!await task.cmd("file.write", { path: mem.arg.fileAddr, data })
	}
	const folder = File.dirname(mem.arg.fileAddr)
	let path = await fileDialog({
		mode: "save",
		path: File.at(folder) ? folder : undefined,
		fileName: File.basename(mem.arg.fileAddr),
		parentTaskId: task.id,
	})
	if (!path) return false
	const existing = File.at(path)
	if (existing && existing.cfg.class !== "StringFile") return false
	if (!existing) {
		const created = await task.cmd("file.create", {
			path: File.dirname(path),
			Type: "StringFile",
			name: File.basename(path),
			content: "",
		})
		if (!created) return false
		path = created.cfg.path
		File.refreshViews()
	}
	const file = File.at(path)
	mem.arg.fileAddr = path
	mem.arg.file = file
	task.window.setTitle(file.name + " - Monaco")
	task.window.setImage(file.cfg.icon.getImage())
	return !!await task.cmd("file.write", { path, data })
}

task.onEnd = e => {
	mem.editor.dispose()
}