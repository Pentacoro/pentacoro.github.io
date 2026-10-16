import {getTask, runLauncher} from "/plexos/lib/functions/dll.js"
import File from "/plexos/lib/classes/filesystem/file.js"
import { themeRoot } from "/plexos/lib/functions/theme.js"

let task = getTask(/TASKID/)
let mem  = task.mem
let nav  = mem.ui.nav.keyNodes

// The address bar: a typed path goes there, anything else puts the current one back.
// "@/a", "/a" and "a" all mean the same folder here, since the bar only ever shows the core.
function normalizeAddress(typed) {
    return File.toVirtual(String(typed).trim())
}

mem.showAddress = function () {
    nav.address.value = mem.address
}

mem.goToAddress = function (typed) {
    const path = normalizeAddress(typed)
    const target = File.at(path)
    if (target?.cfg?.class === "DirectoryFile") return mem.navigate(path)
    if (target) {
        // A file: open it, or in an Open/Save dialog show the folder it sits in
        if (mem.arg.mode) return mem.navigate(File.dirname(path))
        mem.showAddress()
        return File.open(path)
    }
    mem.showAddress()
    runLauncher("/plexos/app/sys/System/Popup/popup.ls", {
        name: "Explorer",
        type: true,
        title: "Address not found",
        description: `Explorer can't find "${String(typed).trim()}". Check the spelling and try again.`,
        image: `${themeRoot()}/icons/interface/forms/error.png`,
        taskid: task.id,
        detailsHeight: "40px",
        details: [["address", path]],
    })
}
