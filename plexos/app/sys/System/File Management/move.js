import plexos from "/boot/plexos.js"
import File from "/plexos/lib/classes/filesystem/file.js"
import Task from "/plexos/lib/classes/system/task.js"
import FileLock from "/plexos/lib/classes/system/fileLock.js"
import { genRanHex } from "/plexos/lib/functions/dll.js"
import { coreReadOnly } from "/plexos/lib/functions/readOnly.js"
import { ensureSystemApp } from "/plexos/app/sys/System/system.js"

const root = "/plexos/app/sys/System/File Management"
const revealAfter = 1000
const cascadeStep = 28
const progressShown = new Set()

// Milliseconds added before each file. Override, when filled in, replaces the pace.
export const transferPaces = {
    moderate: 400,
    slow: 900,
    slowest: 1800,
}

export function transferDelay() {
    const transfer = plexos.Settings?.system?.transfer || {}
    const typed = String(transfer.override ?? "").trim()
    if (typed !== "") {
        const ms = Number(typed)
        if (Number.isFinite(ms) && ms >= 0) return ms
    }
    return transferPaces[transfer.pace] || 0
}

function iconRecord(node) {
    const rootNode = node.closest?.(".explorerIcon, .icon")
    if (!rootNode) return null
    for (const task of plexos.Tasks) {
        const list = task.mem?.iconArr || task.mem?.iconArray || []
        const hit = list.find(icon => icon.node === rootNode)
        if (hit) return hit
    }
    return null
}

function taskAt(node) {
    const win = node.closest?.(".window")
    if (!win) return null
    for (const name of win.classList) {
        const task = Task.id(name)
        if (task) return task
    }
    return null
}

function rawDestination(x, y, paths) {
    const el = document.elementFromPoint(x, y)
    if (!el) return null
    // an Explorer sidebar item (a pin, or the bin) is the folder it stands for
    const sideItem = el.closest(".sidePanel-item")
    if (sideItem?.dataset.path) return sideItem.dataset.path
    const iconNode = el.closest(".explorerIcon, .icon")
    if (iconNode) {
        const icon = iconRecord(iconNode)
        const file = icon ? File.at(icon.file) : null // a stale icon (its folder is gone) counts as the view behind it
        if (file?.cfg?.class === "DirectoryFile" && !paths.includes(icon.file)) return icon.file
    }
    if (!el.closest(".window") && el.closest("#iconLayer, #desktopLayer")) {
        return Task.get("Desktop")?.mem?.dirObject?.cfg?.path || null
    }
    const task = taskAt(el)
    if (task && typeof task.mem?.createExplorerIcons === "function") {
        return task.mem.dirObject?.cfg?.path || null
    }
    return null
}

// Where a drop should land, or null. Null without a word when every file already lives there, so a desktop nudge
// still repositions. A destination nothing can go into, or files that all can't, get the Invalid move popup.
// When only some can't, the drop goes ahead and moveFiles skips those, saying so.
export function destinationAt(x, y, paths) {
    // empty space in an Explorer sidebar pins the dragged folders there instead of moving anything
    const el = document.elementFromPoint(x, y)
    if (el?.closest(".sidePanel") && !el.closest(".sidePanel-item")) {
        const explorer = taskAt(el)
        for (const path of paths) {
            const file = File.at(path)
            if (file?.cfg?.class === "DirectoryFile" && !File.inBin(path) && !File.isBin(file)) explorer?.mem?.pinFolder?.(path)
        }
        return null
    }
    const address = rawDestination(x, y, paths)
    if (address === null) return null
    const problem = destinationProblem(address)
    if (problem) {
        invalidMove([problem])
        return null
    }
    const dest = File.at(address)
    const files = paths.map(path => File.at(path)).filter(file => file && !alreadyThere(file, dest))
    if (!files.length) return null
    const problems = files.map(file => fileProblem(file, dest)).filter(Boolean)
    if (problems.length === files.length) {
        invalidMove(problems)
        return null
    }
    return dest.cfg.path
}

// One popup per job, whatever went wrong: titled Invalid move, with only an OK button
function invalidMove(problems) {
    if (!problems.length) return
    const more = problems.length - 1
    plexos.System.popup(null, [["OK"]], {
        name: "Invalid move",
        type: false,
        title: problems[0].title,
        description: problems[0].description + (more ? ` ${more} more item${more === 1 ? "" : "s"} couldn't be moved either.` : ""),
        icon: "",
    })
}

// Why nothing can be moved into destPath, or null. token is the asking job's own lock, which doesn't count
function destinationProblem(destPath, token = null) {
    if (coreReadOnly()) {
        return { title: "Read-only desktop", description: "This desktop is read-only, so nothing in it can be moved." }
    }
    const dest = File.at(destPath)
    if (dest?.cfg?.class !== "DirectoryFile") {
        const name = File.basename(destPath) || destPath
        return { title: "Folder not found", description: `The folder "${name}" no longer exists. It may have been moved, renamed or deleted.` }
    }
    if (dest.cfg.edit === false) {
        return { title: "Read-only folder", description: `"${dest.name}" is read-only, so nothing can be moved into it.` }
    }
    const lock = FileLock.blocking(destPath, token)
    if (lock) {
        return { title: "Folder in use", description: `"${dest.name}" is being used by ${lock.app}, so nothing can be moved into it right now.` }
    }
    return null
}

// Why this one file can't go into dest, or null
function fileProblem(file, dest, token = null) {
    const into = file.cfg.path
    if (dest.cfg.path === into) {
        return { title: "Can't move folder", description: `"${file.name}" can't be moved into itself.` }
    }
    if (dest.cfg.path.startsWith(into + "/")) {
        return { title: "Can't move folder", description: `"${file.name}" can't be moved into "${dest.name}", because that folder is inside it.` }
    }
    if (file.cfg.move === false) {
        return { title: "Can't move file", description: `"${file.name}" can't be moved.` }
    }
    const lock = FileLock.blocking(into, token, { deep: true })
    if (lock) {
        return { title: "File in use", description: `"${file.name}" is being used by ${lock.app}, so it can't be moved right now.` }
    }
    return null
}

// Already in dest: nothing to do, and nothing wrong
function alreadyThere(file, dest) {
    return file.parent()?.cfg?.path === dest.cfg.path
}

function removeIcon(path) {
    for (const task of plexos.Tasks) task.mem?.getIcon?.(path)?.deleteNode?.()
}

function iconOf(file) {
    try {
        return file?.cfg?.icon?.getImage?.() || ""
    } catch {
        return ""
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function askConflict(file, dest, job) {
    return new Promise(resolve => {
        let settled = false
        const finish = (choice) => {
            if (settled) return
            settled = true
            resolve(choice)
        }
        const watch = () => { if (job?.cancelled) finish(null) }
        job?.listeners?.add(watch)
        plexos.System.persistentWindow({
            name: "File Conflict",
            app: "System",
            url: root + "/conflict.html",
            args: { fileName: file.name, folder: dest.name, finish },
            onClose: () => finish(null),
            appParams: { initialDrawPosition: "center" },
        }).catch(() => finish(null))
    })
}

async function hold(job) {
    while (job.paused && !job.cancelled) {
        job.touch()
        await sleep(40)
    }
}

function reveal(job) {
    if (job.revealed || job.finished || job.worked < revealAfter) return
    job.revealed = true
    job.progress = "opening"
    plexos.System.persistentWindow({
        name: "Moving",
        app: "System",
        url: root + "/progress.html",
        args: { job },
        onClose: () => {
            job.cancelled = true
            job.paused = false
            job.progress = null
            job.touch()
        },
        appParams: { initialDrawPosition: "center" },
    }).then(win => {
        job.progress = win
        if (job.finished && win) return Task.id(win.task)?.end()
        // Each dialog already open pushes this one down and right, so none hides another.
        for (const shown of [...progressShown]) if (!shown.node?.isConnected) progressShown.delete(shown)
        const offset = progressShown.size * cascadeStep
        progressShown.add(win)
        if (win?.drawParams && offset) {
            win.drawParams.posX += offset
            win.drawParams.posY += offset
            win.poseNode()
        }
    }).catch(() => { job.progress = null })
}

async function pace(job, index) {
    const ms = job.delay
    if (ms <= 0 || job.cancelled) return
    let start = performance.now()
    let consumed = 0
    while (!job.cancelled && consumed < ms) {
        if (job.paused) {
            job.touch()
            const mark = performance.now()
            while (job.paused && !job.cancelled) await sleep(40)
            start += performance.now() - mark
        }
        consumed = Math.max(0, performance.now() - start)
        const into = Math.min(ms, consumed)
        job.worked = job.workedBase + into
        job.fraction = (index + into / ms) / job.total
        job.touch()
        reveal(job)
        if (!job.cancelled && !job.paused && consumed < ms) await sleep(40)
    }
    if (!job.cancelled) {
        job.workedBase += ms
        job.worked = job.workedBase
    }
}

// Transfers run side by side. Each job locks its own files, so two jobs never move the same thing.
// by: the task the user moved things from (Explorer or the Desktop). Its moves become steps the user can undo
export async function moveFiles(paths, to, origin = null, by = null) {
    ensureSystemApp()
    const system = plexos.System
    if (!system?.cmd) return { moved: 0 }
    const holder = {
        token: "transfer-" + genRanHex(12),
        taskId: system.id,
        appID: system.appID || null,
        app: "File Transfer",
    }
    const problem = destinationProblem(to, holder.token)
    if (problem) {
        invalidMove([problem])
        return { moved: 0 }
    }
    const dest = File.at(to)

    // Each file is checked on its own: one that can't go is skipped, the rest move
    const problems = []
    const items = paths.map(path => File.at(path)).filter(file => {
        if (!file || alreadyThere(file, dest)) return false
        const why = fileProblem(file, dest, holder.token)
        if (why) problems.push(why)
        return !why && FileLock.acquire(file.cfg.path, holder)
    })
    invalidMove(problems)
    if (!items.length) {
        FileLock.releaseAll(holder.token)
        return { moved: 0 }
    }

    const fromFolders = [...new Set(items.map(file => file.parent()?.cfg?.path).filter(path => path !== undefined))]
    const movedPaths = []
    const lateProblems = []
    const desktop = Task.get("Desktop")
    const placement =(origin && desktop?.mem?.cellFromPoint && dest.cfg.path === desktop.mem.dirObject?.cfg?.path)
        ? desktop.mem.cellFromPoint(origin.x, origin.y)
        : null
    const job = {
        lockToken: holder.token,
        by: by ? { appID: by.appID, taskId: by.id } : null,
        group: by ? genRanHex(12) : null, // a transfer the user started undoes as one step
        total: items.length,
        // into or out of the bin a file never really moves on disk, so neither has the transfer pace
        delay: (File.isBin(dest) || items.every(file => File.inBin(file.cfg.path))) ? 0 : transferDelay(),
        fraction: 0,
        worked: 0,
        workedBase: 0,
        label: items[0].name,
        icon: iconOf(items[0]),
        from: items[0].parent()?.name || "",
        to: dest.name,
        fromPath: items[0].parent()?.cfg?.path || "",
        toPath: dest.cfg.path,
        index: 0,
        listeners: new Set(),
        revealed: false,
        finished: false,
        cancelled: false,
        paused: false,
        progress: null,
    }
    job.touch = () => { for (const fn of job.listeners) fn() }
    job.togglePause = () => {
        job.paused = !job.paused
        job.touch()
    }
    job.cancel = () => {
        job.cancelled = true
        job.paused = false
        job.touch()
    }

    let moved = 0
    const arrived = new Map() // where each file that moved came from, and where it is now
    let policy = null
    try {
        for (let index = 0; index < items.length; index++) {
            if (job.cancelled) break
            await hold(job)
            if (job.cancelled) break
            const file = items[index]
            job.index = index
            job.label = file.name
            job.icon = iconOf(file)
            job.touch()

            const occupant = File.isBin(dest) ? null : dest.dir?.[file.name] // the bin takes duplicate names
            let action = "keep"
            if (occupant && occupant !== file) {
                action = policy
                if (!action) {
                    const choice = await askConflict(file, dest, job)
                    if (!choice) {
                        job.cancelled = true
                        break
                    }
                    action = choice.action
                    if (choice.all) policy = action
                }
                if (action === "skip") {
                    job.fraction = (index + 1) / job.total
                    job.touch()
                    continue
                }
                if (action === "replace") {
                    removeIcon(occupant.cfg.path)
                    await system.cmd("file.delete", { path: occupant.cfg.path, lockToken: job.lockToken })
                    if (File.at(occupant.cfg.path)) {
                        job.fraction = (index + 1) / job.total
                        job.touch()
                        continue
                    }
                }
                if (action === "keep") {
                    const next = File.returnAvailableName(file.name, file.cfg.icon, dest)
                    if (next !== file.name) {
                        file.name = next
                        const extension = file.cfg.class === "DirectoryFile"
                            ? "dir"
                            : ((next.match(/\.(?:.(?<!\.))+$/s) || [""])[0] || "")
                        file.cfg.exte = extension
                        if (file.cfg.icon) {
                            file.cfg.icon.name = next
                            file.cfg.icon.exte = extension
                        }
                        job.label = next
                        job.touch()
                    }
                }
            }

            await pace(job, index)
            await hold(job)
            if (job.cancelled) break
            // Things change while a transfer runs, so each file is checked again right before it moves.
            // A destination that's gone ends the job. A file that's gone is skipped quietly, one that can't go is noted
            const destGone = destinationProblem(dest.cfg.path, job.lockToken)
            if (destGone) {
                lateProblems.push(destGone)
                break
            }
            const why = (File.at(file.cfg.path) === file) ? fileProblem(file, dest, job.lockToken) : null
            if (File.at(file.cfg.path) !== file || why) {
                if (why) lateProblems.push(why)
                job.fraction = (index + 1) / job.total
                job.touch()
                continue
            }
            // The desktop places new icons from this cell. Jobs share it, so it's set only around this move.
            // Something coming back from the bin to the desktop starts from the cell it left (with the grid on)
            const toDesktop = dest.cfg.path === desktop?.mem?.dirObject?.cfg?.path
            const left = File.binEntry(file.cfg.path)?.place
            const cell = (toDesktop && left?.grid) ? { ax: left.ax, ay: left.ay } : placement
            // going into the bin from the desktop, it remembers where it sat
            const place = File.isBin(dest) ? desktop?.mem?.placeOf?.(file.cfg.path) || null : null
            if (cell && desktop?.mem) desktop.mem.placementOrigin = cell
            const fromPath = file.cfg.path
            const result = await system.cmd("file.move", { path: file.cfg.path, to: dest.cfg.path, lockToken: job.lockToken, by: job.by, group: job.group, place })
            if (cell && desktop?.mem?.placementOrigin === cell) desktop.mem.placementOrigin = null
            if (result) {
                moved++
                movedPaths.push(result.cfg.path)
                arrived.set(fromPath, result.cfg.path)
                FileLock.release(result.cfg?.path, job.lockToken)
            }
            job.fraction = (index + 1) / job.total
            job.touch()
        }
    } finally {
        FileLock.releaseAll(job.lockToken)
        invalidMove(lateProblems)
        job.finished = true
        job.fraction = job.cancelled ? job.fraction : 1
        job.touch()
        if (job.progress && job.progress !== "opening") Task.id(job.progress.task)?.end()
        // Explorer views and the desktop resync on this, and the destination selects what arrived
        plexos.System.bus.emit("transfer-finished", {
            to: dest.cfg.path,
            from: fromFolders,
            moved: movedPaths,
            cancelled: job.cancelled,
        })
        if (moved && plexos.Core?.mem?.saveCore) {
            try { await plexos.Core.mem.saveCore() } catch (error) { console.error(error) }
        }
    }
    return { moved, arrived }
}
