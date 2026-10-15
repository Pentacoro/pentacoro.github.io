import plexos from "/boot/plexos.js"
import File from "/plexos/lib/classes/filesystem/file.js"
import Task from "/plexos/lib/classes/system/task.js"
import { coreReadOnly } from "/plexos/lib/functions/readOnly.js"
import { ensureSystemApp } from "/plexos/app/sys/System/system.js"

const root = "/plexos/app/sys/System/File Management"
const revealAfter = 1000

// Milliseconds added before each file. Override, when filled in, replaces the pace.
export const transferPaces = {
    moderate: 400,
    slow: 900,
    slowest: 1800,
}

let moving = false

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
    const iconNode = el.closest(".explorerIcon, .icon")
    if (iconNode) {
        const icon = iconRecord(iconNode)
        const file = icon ? File.at(icon.file) : null
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

// Where a drop should land. Null when every file already lives there, so a desktop nudge still repositions.
export function destinationAt(x, y, paths) {
    const address = rawDestination(x, y, paths)
    const dest = address ? File.at(address) : null
    if (!dest || dest.cfg?.class !== "DirectoryFile") return null
    const movable = paths.some(path => canMove(File.at(path), dest))
    return movable ? dest.cfg.path : null
}

function canMove(file, dest) {
    if (!file || !dest) return false
    const parent = file.parent()
    const to = dest.cfg.path
    if (!parent || parent.cfg.path === to) return false
    if (to === file.cfg.path || to.startsWith(file.cfg.path + "/")) return false
    return true
}

function removeIcon(path) {
    for (const task of plexos.Tasks) task.mem?.getIcon?.(path)?.deleteNode?.()
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
        if (job.finished && win) Task.id(win.task)?.end()
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

export async function moveFiles(paths, to, origin = null) {
    if (moving || coreReadOnly()) return { moved: 0 }
    ensureSystemApp()
    const dest = File.at(to)
    const system = plexos.System
    if (!dest || dest.cfg?.class !== "DirectoryFile" || !system?.cmd) return { moved: 0 }

    const items = paths.map(path => File.at(path)).filter(file => canMove(file, dest))
    if (!items.length) return { moved: 0 }

    moving = true
    const desktop = Task.get("Desktop")
    if (origin && desktop?.mem?.cellFromPoint && dest.cfg.path === desktop.mem.dirObject?.cfg?.path) {
        desktop.mem.placementOrigin = desktop.mem.cellFromPoint(origin.x, origin.y)
    }
    const job = {
        total: items.length,
        delay: transferDelay(),
        fraction: 0,
        worked: 0,
        workedBase: 0,
        label: items[0].name,
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
    let policy = null
    try {
        for (let index = 0; index < items.length; index++) {
            if (job.cancelled) break
            await hold(job)
            if (job.cancelled) break
            const file = items[index]
            job.index = index
            job.label = file.name
            job.touch()

            const occupant = dest.dir?.[file.name]
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
                    await system.cmd("file.delete", { path: occupant.cfg.path })
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
            const result = await system.cmd("file.move", { path: file.cfg.path, to: dest.cfg.path })
            if (result) moved++
            job.fraction = (index + 1) / job.total
            job.touch()
        }
    } finally {
        if (desktop?.mem) desktop.mem.placementOrigin = null
        job.finished = true
        job.fraction = job.cancelled ? job.fraction : 1
        job.touch()
        if (job.progress && job.progress !== "opening") Task.id(job.progress.task)?.end()
        moving = false
        if (moved && plexos.Core?.mem?.saveCore) {
            try { await plexos.Core.mem.saveCore() } catch (error) { console.error(error) }
        }
    }
    return { moved }
}
