import {getTask} from "/plexos/lib/functions/dll.js"
import File from "/plexos/lib/classes/filesystem/file.js"
import { restoreFromBin } from "/plexos/app/sys/System/File Management/restore.js"

let task = getTask(/TASKID/)
let mem  = task.mem

// The bin, as Explorer shows it. What's in it is restored, never opened: a transfer back to the folder each thing
// came from, so a name taken there meanwhile gets the conflict dialog. Delete in the bin removes things for good,
// after asking, and so does emptying it. Neither can be undone.

mem.inBinView = () => mem.address === File.trashPath

function held() {
    return File.children(File.at(File.trashPath)).map(file => file.cfg.path)
}

mem.restoreFromBin = paths => restoreFromBin(paths, task)

mem.restoreAll = () => mem.restoreFromBin(held())

mem.binHasItems = () => held().length > 0

function confirm(title, description, action) {
    task.popup(null, [["Delete", action], ["Cancel"]], {
        name: "Delete permanently",
        type: false,
        title,
        description,
        icon: "",
    })
}

function deleteAll(paths) {
    for (const path of paths) task.cmd("file.delete", { path })
}

mem.deleteForGood = function (paths) {
    if (!paths.length) return
    const name = File.at(paths[0])?.name
    confirm(
        "Delete permanently?",
        paths.length === 1
            ? `"${name}" will be deleted for good. This can't be undone.`
            : `These ${paths.length} items will be deleted for good. This can't be undone.`,
        () => deleteAll(paths),
    )
}

mem.emptyBin = function () {
    const paths = held()
    if (!paths.length) return
    confirm(
        "Empty the bin?",
        `${paths.length === 1 ? "The item" : `All ${paths.length} items`} in the bin will be deleted for good. This can't be undone.`,
        () => deleteAll(paths),
    )
}

// The selected things in the bin, or just the one right-clicked when it isn't selected
mem.binSelection = function (icon) {
    const picked = task.pocket.includes(icon) ? task.pocket : [icon]
    return picked.map(each => each.file).filter(path => File.dirname(path) === File.trashPath)
}
