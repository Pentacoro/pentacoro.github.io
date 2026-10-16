import { getTask } from "/plexos/lib/functions/dll.js"
import { control } from "/plexos/lib/functions/controls.js"
import { themeRoot } from "/plexos/lib/functions/theme.js"
import File from "/plexos/lib/classes/filesystem/file.js"

const task = getTask(/TASKID/)
const job = task.mem.arg.job
const root = task.node.getElementById(task.id + "_root")
root.classList.add("sys-inset")

function folderImage(path) {
    try {
        const image = File.at(path)?.cfg?.icon?.getImage?.()
        if (image) return image
    } catch { /* the folder may be gone */ }
    return themeRoot() + "/icons/files/images/folder.svg"
}

function openFolder(path) {
    if (!path || File.at(path)?.cfg?.class !== "DirectoryFile") return
    File.open(path)
}

function folderLink(name, path) {
    const link = document.createElement("span")
    link.className = "transfer-link"
    link.textContent = name
    link.title = path
    link.tabIndex = 0
    link.setAttribute("role", "link")
    link.onclick = () => openFolder(path)
    link.onkeydown = (e) => { if (e.key === "Enter") openFolder(path) }
    return link
}

function stageIcon(className, src) {
    const img = document.createElement("img")
    img.className = className
    img.draggable = false
    if (src) img.src = src
    return img
}

const summary = document.createElement("div")
summary.className = "transfer-summary"
const count = job.total === 1 ? "1 item" : job.total + " items"
summary.append(
    "Moving " + count + " from ",
    folderLink(job.from, job.fromPath),
    " to ",
    folderLink(job.to, job.toPath),
)

// Origin and destination folders at either end. The current file travels the lane between them.
const stage = document.createElement("div")
stage.className = "transfer-stage"
const lane = document.createElement("div")
lane.className = "transfer-lane"
const traveler = stageIcon("transfer-traveler", job.icon)
lane.appendChild(traveler)
stage.append(
    stageIcon("transfer-folder", folderImage(job.fromPath)),
    lane,
    stageIcon("transfer-folder", folderImage(job.toPath)),
)

const copy = document.createElement("div")
copy.className = "transfer-copy"

const status = document.createElement("div")
status.className = "transfer-status"
const percent = document.createElement("span")
percent.className = "transfer-percent"
const actions = document.createElement("div")
actions.className = "transfer-actions"

const pause = document.createElement("button")
pause.type = "button"
pause.title = "Pause"
const pauseIcon = document.createElement("span")
pauseIcon.className = "transfer-glyph pause"
pause.appendChild(pauseIcon)

const cancel = document.createElement("button")
cancel.type = "button"
cancel.title = "Cancel"
cancel.className = "transfer-cancel"
cancel.textContent = "×"

actions.append(pause, cancel)
status.append(percent, actions)

const details = document.createElement("div")
details.className = "transfer-details"
const fileLine = document.createElement("div")
const fromLine = document.createElement("div")
const timeLine = document.createElement("div")
details.append(fileLine, fromLine, timeLine)

const more = control("disclosureButton", { label: "More details" })
more.node.addEventListener("click", () => {
    const open = !more.node.classList.contains("open")
    more.node.classList.toggle("open", open)
    more.node.classList.toggle("closed", !open)
    details.classList.toggle("open", open)
})

const track = document.createElement("div")
track.className = "transfer-track"
const bar = document.createElement("div")
bar.className = "transfer-bar"
track.appendChild(bar)

copy.append(summary, status, details)
root.append(stage, copy, more.node, track)

pause.onclick = () => job.togglePause()
cancel.onclick = () => job.cancel()

// Each file waits job.delay (the transfer pace setting) before it moves, so that wait is the time left.
function remainingText() {
    const left = Math.max(0, job.total - (job.fraction || 0) * job.total)
    const seconds = Math.ceil(left * job.delay / 1000)
    if (seconds < 1) return "Less than a second"
    const minutes = Math.floor(seconds / 60)
    const rest = seconds % 60
    const parts = []
    if (minutes) parts.push(minutes + (minutes === 1 ? " minute" : " minutes"))
    if (rest) parts.push(rest + (rest === 1 ? " second" : " seconds"))
    return "About " + parts.join(" ")
}

let lastStep = 0
let lastIcon = job.icon

function paintTraveler() {
    const step = Math.max(0, Math.min(1, (job.fraction || 0) * job.total - job.index))
    // A new file starts back at the origin without sliding there.
    const jump = step < lastStep || job.icon !== lastIcon
    if (jump) traveler.classList.add("jump")
    if (job.icon !== lastIcon) {
        traveler.src = job.icon || ""
        lastIcon = job.icon
    }
    lastStep = step
    // Small at both folders, full size halfway across.
    const scale = 0.3 + 0.7 * Math.sin(Math.PI * step)
    traveler.style.left = (step * 100) + "%"
    traveler.style.transform = "translate(-50%, -50%) scale(" + scale.toFixed(3) + ")"
    traveler.style.visibility = (!job.icon || job.finished) ? "hidden" : ""
    if (jump) {
        void traveler.offsetWidth
        traveler.classList.remove("jump")
    }
}

function paint() {
    const pct = Math.max(0, Math.min(100, Math.round((job.fraction || 0) * 100)))
    const label = (job.paused ? "Paused - " : "") + pct + "% complete"
    percent.textContent = label
    bar.style.width = pct + "%"
    fileLine.textContent = job.label || ""
    fromLine.textContent = "From " + job.fromPath + " to " + job.toPath
    timeLine.textContent = "Time remaining: " + remainingText() + (job.paused ? " (paused)" : "")
    pause.title = job.paused ? "Resume" : "Pause"
    pauseIcon.className = job.paused ? "transfer-glyph play" : "transfer-glyph pause"
    paintTraveler()
    const title = task.window?.keyNodes?.title
    if (title) title.textContent = label
}
job.listeners.add(paint)
paint()
