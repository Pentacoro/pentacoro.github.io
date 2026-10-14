import plexos from "./plexos.js"
import ContextMenu from "../plexos/lib/classes/interface/contextmenu.js"
import { el, landing, uniqueName } from "./state.js"
import { closePopup, fitCoreMenu, resetLogonPlace } from "./stage.js"
import { landingContent } from "./window.js"
import { dismissTiles, slideTile } from "./motion.js"
import { showCores } from "./cores.js"

function byArrival(users) {
    // getAll is alphabetical. created keeps each new user on the right of the row.
    return [...users].sort((a, b) => (a.created || 0) - (b.created || 0) || a.name.localeCompare(b.name))
}

function avatar(user) {
    if (user.config?.profileImage) {
        const img = el("img", "landing-avatar")
        img.alt = ""
        img.src = user.config.profileImage
        return img
    }
    return el("span", "landing-avatar", (user.name || "?").slice(0, 1).toUpperCase())
}

function userTile(user) {
    const tile = el("button", "landing-tile")
    tile.type = "button"
    tile.userRecord = user
    tile.append(avatar(user), el("span", "landing-name", user.name))
    tile.onclick = () => {
        if (landing.stage.classList.contains("picked")) {
            if (tile.classList.contains("chosen")) showUserRow()
            return
        }
        hideForm()
        chooseUser(user, tile)
    }
    tile.oncontextmenu = event => ContextMenu.open(event, tile, profileMenu(tile))
    return tile
}

function profileMenu(tile) {
    return [{
        name: "user",
        list: [
            { name: "Open", icon: "url('/THEME/icons/interface/contextMenu/open.svg')", func: () => chooseUser(tile.userRecord, tile) },
            { name: "Edit", icon: "url('/THEME/icons/interface/contextMenu/rename.svg')", func: () => editUser(tile.userRecord, tile) },
            { name: "Delete", icon: "url('/THEME/icons/interface/contextMenu/delete.svg')", func: () => confirmDelete(tile) },
        ],
    }]
}

function createUserMenu() {
    return [{
        name: "user",
        list: [
            { name: "Create user", icon: "url('/THEME/icons/interface/contextMenu/new.svg')", func: createGenericUser },
        ],
    }]
}

function createTile() {
    const tile = el("button", "landing-tile landing-create")
    tile.type = "button"
    const plus = el("span", "landing-avatar landing-plus")
    plus.setAttribute("aria-hidden", "true")
    tile.append(plus, el("span", "landing-name", "Create user"))
    tile.onclick = () => createGenericUser({ slide: true })
    return tile
}

function profileTiles() {
    return [...(landing.usersRow?.children || [])].filter(node => node.classList.contains("landing-tile") && !node.classList.contains("landing-create"))
}

export function showUserRow() {
    // Drop a fade that was already scheduled, so it cannot open the menu again after we leave.
    landing.logonReveal++
    resetLogonPlace()
    const tile = landing.usersRow?.querySelector(".landing-tile.chosen") || landing.usersRow?.firstElementChild
    if (tile) slideTile(tile, false)
    else landing.stage?.classList.remove("picked")
    if (landing.logon) {
        landing.logon.classList.remove("open", "together")
        landing.logon.replaceChildren()
    }
}

async function chooseUser(user, tile) {
    user.localCores = user.localCores || []
    user.remoteCores = user.remoteCores || {}
    user.config = user.config || { lastOpenedCore: null, profileImage: null, password: null }
    plexos.System.user = user
    plexos.User = user.name
    plexos.Config.lastUserLog = user.name
    if (!plexos.Config.defaultUser) plexos.Config.defaultUser = user.name
    if (!tile.classList.contains("chosen")) slideTile(tile, true)
    showCores("local")
    await plexos.db.setConfig(plexos.Config)
}

function editUser(user, tile, options) {
    hideForm()
    closePopup()
    if (!tile.classList.contains("chosen")) slideTile(tile, true)
    showEditor(tile, options)
}

function refreshTileFace(tile) {
    const user = tile.userRecord
    const name = tile.querySelector(".landing-name")
    if (name) name.textContent = user.name
    const face = tile.querySelector(".landing-avatar")
    if (!face || user.config?.profileImage) return
    if (face.tagName === "SPAN") face.textContent = (user.name || "?").slice(0, 1).toUpperCase()
}

async function renameUser(user, next) {
    const previous = user.name
    const taken = (await plexos.db.listUsers()).some(other => other.name === next)
    if (taken) return "That name is already taken."
    user.name = next
    try {
        await plexos.db.saveUser(user)
        if (previous !== next) await plexos.db.deleteUser(previous)
    } catch (error) {
        user.name = previous
        throw error
    }
    if (plexos.Config.lastUserLog === previous) plexos.Config.lastUserLog = next
    if (plexos.Config.defaultUser === previous) plexos.Config.defaultUser = next
    if (plexos.System.user?.name === previous) {
        plexos.System.user = user
        plexos.User = next
    }
    await plexos.db.setConfig(plexos.Config)
    return ""
}

function showEditor(tile, { created = false, hold = false } = {}) {
    const user = tile.userRecord
    const { logon } = landing
    resetLogonPlace()
    const revealId = ++landing.logonReveal
    const reveal = !hold && !logon.classList.contains("open")
    logon.replaceChildren()

    const nameField = el("label", "landing-field")
    const error = el("p", "landing-error")
    const nameHead = el("div", "landing-field-head")
    nameHead.append(el("span", null, "Name"), error)
    const nameInput = document.createElement("input")
    nameInput.type = "text"
    nameInput.autocomplete = "off"
    nameInput.value = user.name
    nameField.append(nameHead, nameInput)

    const nav = el("div", "landing-edit-nav")
    const back = el("button", "landing-link", "← go back")
    const cores = el("button", "landing-link", "go to cores →")
    back.type = "button"
    cores.type = "button"
    nav.append(back, cores)
    nameField.append(nav)

    let renaming = null
    const commitName = () => {
        if (renaming) return renaming
        const next = nameInput.value.trim()
        if (!next || next === user.name) {
            nameInput.value = user.name
            error.textContent = next ? "" : "A name is required."
            return Promise.resolve(next ? "" : "A name is required.")
        }
        renaming = renameUser(user, next).then(message => {
            renaming = null
            error.textContent = message
            if (!message) refreshTileFace(tile)
            else nameInput.value = user.name
            return message
        }).catch(() => {
            renaming = null
            error.textContent = "Could not rename this user."
            nameInput.value = user.name
            return "Could not rename this user."
        })
        return renaming
    }
    const leave = async (next) => {
        if (await commitName()) return
        next()
    }
    nameInput.oninput = () => { error.textContent = "" }
    nameInput.onchange = () => commitName()
    nameInput.onkeydown = event => {
        if (event.key !== "Enter") return
        event.preventDefault()
        // A profile that was just created continues to its cores. An existing one returns to the row.
        leave(() => created ? chooseUser(tile.userRecord, tile) : showUserRow())
    }
    back.onclick = () => leave(() => showUserRow())
    cores.onclick = () => leave(() => chooseUser(tile.userRecord, tile))

    const picture = el("button", "landing-core", "Change picture")
    picture.type = "button"
    const file = document.createElement("input")
    file.type = "file"
    file.accept = "image/*"
    file.className = "landing-file"
    picture.onclick = () => file.click()
    file.onchange = async () => {
        const chosen = file.files?.[0]
        file.value = ""
        if (!chosen) return
        const image = await readPicture(chosen)
        if (!image) return
        user.config = user.config || { lastOpenedCore: null, profileImage: null, password: null }
        user.config.profileImage = image
        await plexos.db.saveUser(user)
        tile.querySelector(".landing-avatar")?.replaceWith(avatar(user))
    }

    const remove = el("button", "landing-core", "Delete")
    remove.type = "button"
    remove.onclick = async () => {
        if (renaming) await renaming
        confirmDelete(tile)
    }

    logon.append(nameField, picture, file, remove)
    if (hold) {
        logon.classList.remove("open")
        logon.offsetWidth
    } else if (reveal) {
        logon.classList.remove("open")
        logon.offsetWidth
        requestAnimationFrame(() => {
            if (revealId !== landing.logonReveal) return
            logon.classList.add("open")
        })
    }
    nameInput.focus()
    nameInput.select()
}

function confirmDelete(tile) {
    const user = tile.userRecord
    closePopup()
    const popup = el("div", "landing-popup")
    const card = el("div", "landing-popup-card")
    const actions = el("div", "landing-actions")
    const cancel = el("button", "landing-button quiet", "Cancel")
    const ok = el("button", "landing-button", "Delete")
    cancel.type = "button"
    ok.type = "button"
    cancel.onclick = () => closePopup()
    ok.onclick = async () => {
        ok.disabled = true
        await plexos.db.deleteUser(user.name)
        if (plexos.Config.lastUserLog === user.name) plexos.Config.lastUserLog = null
        if (plexos.Config.defaultUser === user.name) plexos.Config.defaultUser = null
        if (plexos.System.user?.name === user.name) {
            plexos.System.user = null
            plexos.User = null
        }
        await plexos.db.setConfig(plexos.Config)
        closePopup()
        await paintUsers()
    }
    actions.append(cancel, ok)
    card.append(el("p", "landing-lead", "Are you sure?"), el("p", "landing-note", "This can't be undone."), actions)
    popup.append(card)
    landing.stage.append(popup)
    landing.popup = popup
}

async function createGenericUser({ slide = false } = {}) {
    if (landing.creatingUser) return
    landing.creatingUser = true
    try {
        const names = (await plexos.db.listUsers()).map(user => user.name)
        const name = uniqueName("User", names)
        const user = {
            name,
            created: Date.now(),
            localCores: [],
            remoteCores: { Plexos: "/core.json" },
            config: { lastOpenedCore: null, profileImage: null, password: null },
        }
        await plexos.db.saveUser(user)
        hideForm()
        if (slide) presentFromPlus(user)
        else presentAfterFade(user)
    } finally {
        landing.creatingUser = false
    }
}

function presentFromPlus(user) {
    landing.usersRow.querySelector(".landing-create")?.remove()
    const tile = userTile(user)
    tile.dataset.slot = "0"
    landing.usersRow.append(tile)
    editUser(user, tile, { created: true })
}

function presentAfterFade(user) {
    // The row is gone at once. The new square and the edit menu fade in after that.
    const { logon, stage, usersRow } = landing
    landing.slideToken++
    logon.style.transition = "none"
    logon.classList.remove("open", "together")
    logon.replaceChildren()
    logon.offsetWidth
    logon.style.transition = ""
    const parked = [...stage.querySelectorAll(":scope > .landing-tile.parked:not(.landing-create)")]
    const existing = profileTiles()
    const plus = usersRow.querySelector(".landing-create")
    const slot = String(parked.length + existing.length)
    if (existing.length) dismissTiles(existing)
    plus?.remove()
    const tile = userTile(user)
    tile.dataset.slot = slot
    tile.classList.add("gone")
    usersRow.append(tile)
    stage.classList.add("picked")
    tile.classList.add("chosen")
    showEditor(tile, { created: true, hold: true })
    const revealId = landing.logonReveal
    logon.classList.add("together")
    // Opacity 0 has to paint once, or removing it in the same frame skips the fade.
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            if (!tile.isConnected) return
            tile.classList.remove("gone")
            if (revealId !== landing.logonReveal) return
            logon.classList.add("open")
        })
    })
}

function readPicture(file) {
    return new Promise(resolve => {
        const img = new Image()
        const url = URL.createObjectURL(file)
        img.onload = () => {
            const size = 96
            const canvas = document.createElement("canvas")
            canvas.width = size
            canvas.height = size
            const scale = Math.max(size / img.width, size / img.height)
            const width = img.width * scale
            const height = img.height * scale
            canvas.getContext("2d").drawImage(img, (size - width) / 2, (size - height) / 2, width, height)
            URL.revokeObjectURL(url)
            resolve(canvas.toDataURL("image/jpeg", 0.85))
        }
        img.onerror = () => {
            URL.revokeObjectURL(url)
            resolve(null)
        }
        img.src = url
    })
}

function hideForm() {
    if (!landing.formPanel) return
    landing.formPanel.hidden = true
    landing.formPanel.replaceChildren()
}

function renderUserForm() {
    const { formPanel } = landing
    formPanel.replaceChildren()
    formPanel.hidden = false
    let picture = null

    const nameField = el("label", "landing-field")
    nameField.append(el("span", null, "Name"))
    const nameInput = document.createElement("input")
    nameInput.type = "text"
    nameInput.autocomplete = "off"
    nameField.append(nameInput)

    const pictureField = el("label", "landing-field")
    pictureField.append(el("span", null, "Picture"))
    const portrait = el("span", "landing-portrait", "?")
    const file = document.createElement("input")
    file.type = "file"
    file.accept = "image/*"
    file.onchange = async () => {
        const chosen = file.files?.[0]
        if (!chosen) return
        picture = await readPicture(chosen)
        if (!picture) return
        const img = el("img", "landing-portrait")
        img.alt = ""
        img.src = picture
        portrait.replaceWith(img)
    }
    pictureField.append(file)

    const error = el("p", "landing-error")
    const actions = el("div", "landing-actions")
    if (profileTiles().length) {
        const cancel = el("button", "landing-button quiet", "Cancel")
        cancel.type = "button"
        cancel.onclick = () => hideForm()
        actions.append(cancel)
    }
    const submit = el("button", "landing-button", "Create")
    submit.type = "button"
    const create = async () => {
        const name = nameInput.value.trim()
        if (!name) {
            error.textContent = "A name is required."
            return
        }
        const users = await plexos.db.listUsers()
        if (users.some(user => user.name === name)) {
            error.textContent = "That name is already taken."
            return
        }
        const user = {
            name,
            created: Date.now(),
            localCores: [],
            remoteCores: { Plexos: "/core.json" },
            config: {
                lastOpenedCore: null,
                profileImage: picture,
                password: null,
            },
        }
        await plexos.db.saveUser(user)
        hideForm()
        await paintUsers()
    }
    submit.onclick = create
    nameInput.oninput = () => { error.textContent = "" }
    nameInput.onkeydown = event => {
        if (event.key === "Enter") create()
    }
    actions.append(submit)
    formPanel.append(el("p", "landing-lead", "New user"), nameField, portrait, pictureField, error, actions)
    nameInput.focus()
}

function ensureStage() {
    const content = landingContent()
    if (landing.stage?.isConnected) return landing.stage
    content.replaceChildren()
    landing.stage = el("div", "landing-stage")
    landing.usersRow = el("div", "landing-users")
    landing.logon = el("div", "landing-logon")
    landing.formPanel = el("div", "landing-form")
    landing.formPanel.hidden = true
    const config = el("button", "landing-config", "Config")
    config.type = "button"
    config.onclick = () => {
        if (landing.formPanel.hidden) renderUserForm()
        else if (landing.usersRow.children.length) hideForm()
    }
    landing.stage.append(landing.usersRow, landing.logon, landing.formPanel, config)
    window.addEventListener("resize", () => fitCoreMenu())
    landing.stage.addEventListener("contextmenu", event => {
        const tile = event.target.closest(".landing-tile")
        if (tile && !tile.classList.contains("landing-create")) return
        if (event.target.closest(".landing-logon, .landing-form, .landing-popup, .landing-config")) return
        ContextMenu.open(event, landing.stage, createUserMenu())
    })
    window.addEventListener("keydown", event => {
        if (event.key !== "Escape" || !landing.stage?.isConnected) return
        if (ContextMenu.node) {
            ContextMenu.close()
            return
        }
        if (landing.popup) {
            closePopup()
            return
        }
        if (landing.logon?.dataset.mode === "core-edit") {
            showCores(landing.logon.dataset.coreTab || "local")
            return
        }
        if (landing.stage.classList.contains("picked")) showUserRow()
    })
    content.append(landing.stage)
    return landing.stage
}

async function paintUsers() {
    ensureStage()
    landing.stage.classList.remove("picked")
    resetLogonPlace()
    landing.logon.classList.remove("open")
    landing.logon.replaceChildren()
    for (const parked of landing.stage.querySelectorAll(":scope > .landing-tile")) parked.remove()
    landing.usersRow.replaceChildren()
    const users = byArrival(await plexos.db.listUsers())
    landing.stage.classList.toggle("empty", users.length === 0)
    users.forEach((user, index) => {
        const tile = userTile(user)
        tile.dataset.slot = String(index)
        landing.usersRow.append(tile)
    })
    if (!users.length) landing.usersRow.append(createTile())
    else hideForm()
}

export async function showUsers() {
    await paintUsers()
}
