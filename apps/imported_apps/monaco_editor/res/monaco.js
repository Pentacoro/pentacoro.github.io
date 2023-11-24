let task = system.mem.task("TASKID")
let mem  = task.mem
task.apps = ""
mem.fileAddress = "ARG_FILEADDR"
mem.fileData = ARG_TEXTDATA
mem.var = {}
mem.var.continuousContext = false

require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@latest/min/vs' }});
window.MonacoEnvironment = { getWorkerUrl: () => proxy };

let proxy = URL.createObjectURL(new Blob([`
	self.MonacoEnvironment = {
		baseUrl: 'https://unpkg.com/monaco-editor@latest/min/'
	};
	importScripts('https://unpkg.com/monaco-editor@latest/min/vs/base/worker/workerMain.js');
`], { type: 'text/javascript' }));

require(["vs/editor/editor.main"], function () {
	let editor = monaco.editor.create(document.getElementsByClassName('editor ID_TASKID')[0], {
		value: mem.fileData,
		language: 'javascript',
		theme: 'vs-dark',
        automaticLayout: true,
	});
});
