import { getTask } from "/plexos/lib/functions/dll.js"
import { control } from "/plexos/lib/functions/controls.js"

const task = getTask(/TASKID/)
const job = task.mem.arg.job
const root = task.node.getElementById(task.id + "_root")
root.classList.add("sys-inset")

const stage = document.createElement("div")
stage.className = "transfer-stage"

const copy = document.createElement("div")
copy.className = "transfer-copy"

const summary = document.createElement("div")
summary.className = "transfer-summary"
const count = job.total === 1 ? "1 item" : job.total + " items"
summary.textContent = "Moving " + count + " from " + job.from + " to " + job.to

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
cancel.textContent = "\u00d7"

actions.append(pause, cancel)
status.append(percent, actions)

const details = document.createElement("div")
details.className = "transfer-details"
const fileLine = document.createElement("div")
const fromLine = document.createElement("div")
details.append(fileLine, fromLine)

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

function paint() {
    const pct = Math.max(0, Math.min(100, Math.round((job.fraction || 0) * 100)))
    const label = (job.paused ? "Paused - " : "") + pct + "% complete"
    percent.textContent = label
    bar.style.width = pct + "%"
    fileLine.textContent = job.label || ""
    fromLine.textContent = "From " + job.fromPath + " to " + job.toPath
    pause.title = job.paused ? "Resume" : "Pause"
    pauseIcon.className = job.paused ? "transfer-glyph play" : "transfer-glyph pause"
    const title = task.window?.keyNodes?.title
    if (title) title.textContent = label
}
job.listeners.add(paint)
paint()
