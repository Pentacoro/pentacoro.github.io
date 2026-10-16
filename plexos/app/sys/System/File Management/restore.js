import plexos from "/boot/plexos.js"
import File from "/plexos/lib/classes/filesystem/file.js"
import { runLauncher } from "/plexos/lib/functions/dll.js"
import { themeRoot } from "/plexos/lib/functions/theme.js"
import { moveFiles } from "./move.js"

// Things in the bin are restored, never opened or changed. Each group goes back to the folder it came from as a
// transfer, so a name taken there meanwhile gets the conflict dialog. A path inside a recycled folder restores
// the whole folder. Resolves with a map of each bin path to where it went back to.
export async function restoreFromBin(paths, by = null) {
    const byFolder = new Map()
    for (const path of paths) {
        const entry = File.binEntry(path)
        if (!entry) continue
        if (!byFolder.has(entry.from)) byFolder.set(entry.from, new Set())
        byFolder.get(entry.from).add(File.trashPath + "/" + entry.id)
    }
    const results = await Promise.all([...byFolder].map(([from, group]) => moveFiles([...group], from, null, by)))
    return new Map(results.flatMap(result => [...(result.arrived || [])]))
}

// Refusing to open or change something in the bin, with the way out right there. Resolves with where path is once
// it's back, so the caller can go on with what it meant to do, or null when the user leaves it in the bin
export function askRestore(path, actor = null) {
    const entry = File.binEntry(path)
    if (!entry) return Promise.resolve(null)
    const topPath = File.trashPath + "/" + entry.id
    const top = File.at(topPath)
    const name = top?.name ?? File.basename(path)
    const kind = top?.cfg?.class === "DirectoryFile" ? "folder" : "file"
    let decided = false
    return new Promise(resolve => runLauncher("/plexos/app/sys/System/Popup/popup.ls", {
        name: "In the bin",
        type: false,
        title: `This ${kind} is in the bin`,
        description: `"${name}" has to be restored before it can be opened or changed.`,
        image: `${themeRoot()}/icons/interface/forms/error.png`,
        taskid: actor?.window ? actor.id : plexos.System.id,
        onClose: () => { if (!decided) resolve(null) },
        buttons: [
            { label: "Restore", action: async () => {
                decided = true
                // an Explorer goes along to where it's going back to, and selects it as it arrives
                if (actor?.mem?.navigate && File.at(entry.from)) actor.mem.navigate(entry.from)
                const back = (await restoreFromBin([path], actor)).get(topPath)
                resolve(back ? back + path.slice(topPath.length) : null)
            }},
            { label: "Nevermind" },
        ],
    }))
}
