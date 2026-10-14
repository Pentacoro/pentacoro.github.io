import { landing } from "./state.js"

export function closePopup() {
    landing.popup?.remove()
    landing.popup = null
}

export function fitCoreMenu() {
    // Short lists stay level with the square. A list that would run off the bottom
    // shifts up as well, and stops at two thirds of the view.
    const { logon, stage } = landing
    if (!logon?.classList.contains("cores") || !stage) return
    logon.style.top = ""
    logon.style.transform = ""
    const room = stage.clientHeight
    const height = logon.offsetHeight
    const top = logon.offsetTop
    const margin = 16
    if (top >= margin && top + height <= room - margin) return
    let next = (room - height) / 2
    next = Math.max(margin, Math.min(next, room - height - margin))
    logon.style.top = `${next}px`
}

export function resetLogonPlace() {
    const { logon } = landing
    if (!logon) return
    logon.classList.remove("cores")
    logon.style.top = ""
    logon.style.transform = ""
    delete logon.dataset.mode
    delete logon.dataset.coreTab
}
