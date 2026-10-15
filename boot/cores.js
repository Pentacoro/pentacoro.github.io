import plexos from "./plexos.js"
import ContextMenu from "../plexos/lib/classes/interface/contextmenu.js"
import DirectoryFile from "../plexos/lib/classes/filesystem/directory.js"
import initialize, { openDesktop } from "../plexos/ini/init.js"
import { applyThemeFace } from "../plexos/lib/functions/theme.js"
import { installReadOnly } from "../plexos/lib/functions/readOnly.js"
import { el, landing, uniqueName } from "./state.js"
import { closePopup, fitCoreMenu, resetLogonPlace } from "./stage.js"
import { bindManagerAppIDs, closeLanding, releaseWindowLayer } from "./window.js"

const keptDesktopFiles = new Set(["background.json", "grid.json", "icon.json", "taskbar.json"])

function remotesOf(user) {
    const stored = user?.remoteCores
    const list = stored && typeof stored === "object" && !Array.isArray(stored) ? stored : null
    const merged = list ? { Plexos: "/core.json", ...list } : { Plexos: "/core.json" }
    for (const key of Object.keys(merged)) {
        if (merged[key] == null || merged[key] === "") delete merged[key]
    }
    return merged
}

function writeRemotes(user, remotes) {
    const stored = { ...remotes }
    // A missing Plexos key would be filled back in. Null keeps a deletion.
    if (!("Plexos" in stored)) stored.Plexos = null
    user.remoteCores = stored
}

function nodeAt(tree, parts) {
    let node = tree
    for (const part of parts) {
        node = node?.dir?.[part]
        if (!node) return null
    }
    return node
}

export async function bootLocalPlexos() {
    const users = await plexos.db.listUsers()
    const preferred = plexos.Config?.lastUserLog || plexos.Config?.defaultUser
    let user = users.find(item => item.name === preferred) || users[0] || null
    if (!user) {
        user = {
            name: "User",
            created: Date.now(),
            localCores: [],
            remoteCores: { Plexos: "/core.json" },
            config: { lastOpenedCore: null, profileImage: null, password: null },
        }
        await plexos.db.saveUser(user)
        plexos.Config.lastUserLog = user.name
        if (!plexos.Config.defaultUser) plexos.Config.defaultUser = user.name
        await plexos.db.setConfig(plexos.Config)
    }
    user.localCores = user.localCores || []
    user.config = user.config || { lastOpenedCore: null, profileImage: null, password: null }
    plexos.System.user = user
    plexos.User = user.name

    let tree = user.localCores.find(core => core.name === user.config.bootCore)
    if (!tree) {
        const name = uniqueName("Plexos", user.localCores.map(core => core.name))
        tree = await fetchTree("/core.json")
        tree.name = name
        user.localCores = [...user.localCores, tree]
        user.config.bootCore = name
        user.config.lastOpenedCore = name
        await plexos.db.saveUser(user)
    }
    await mountTree(tree, { readOnly: false, name: tree.name })
}

export async function fetchTree(url) {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Could not read ${url}`)
    return response.json()
}

async function bareTree() {
    const tree = await fetchTree("/core.json")
    const desktop = nodeAt(tree, ["user", "desks", "desktop"])
    if (desktop?.dir) {
        for (const key of Object.keys(desktop.dir)) {
            if (!keptDesktopFiles.has(key)) delete desktop.dir[key]
        }
    }
    const iconFile = nodeAt(tree, ["plexos", "cfg", "desks", "desktop", "icon.json"])
    if (iconFile?.data != null) {
        try {
            const data = typeof iconFile.data === "string" ? JSON.parse(iconFile.data) : { ...iconFile.data }
            data.icons = []
            iconFile.data = JSON.stringify(data, null, "\t")
        } catch { /* leave the icon file as it was */ }
    }
    return tree
}

export async function mountTree(tree, { readOnly, name }) {
    if (landing.mounting) return
    landing.mounting = true
    try {
        plexos.Core.mem.readOnly = !!readOnly
        const newCore = DirectoryFile.coreTemplate()
        newCore.name = name || tree.name || newCore.name
        plexos.Core.file = newCore
        await plexos.Core.ini.recreateFiles(tree, newCore)
        if (!readOnly && plexos.System.user) {
            plexos.System.user.config.lastOpenedCore = name || tree.name
            await plexos.db.saveUser(plexos.System.user)
        }
        await initialize()
        bindManagerAppIDs()
        closeLanding()
        await applyThemeFace("session")
        releaseWindowLayer()
        document.body.classList.remove("booting")
        plexos.Core.mem.booting = false
        await openDesktop("/user/desks/desktop")
        if (readOnly) installReadOnly()
    } catch (error) {
        landing.mounting = false
        console.error(error)
        const host = landing.logon?.classList.contains("open") ? landing.logon : landing.formPanel
        host?.append(el("p", "landing-error", error.message || "Could not mount this core."))
    }
}

function coreBytes(core) {
    return new TextEncoder().encode(JSON.stringify(core)).length
}

function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`
    const kb = bytes / 1024
    if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`
    const mb = kb / 1024
    return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`
}

function downloadJson(name, tree) {
    const safe = String(name).replace(/[\\/:*?"<>|]/g, "").trim() || "core"
    const blob = new Blob([JSON.stringify(tree, null, "\t")], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${safe}.json`
    link.click()
    URL.revokeObjectURL(url)
}

async function downloadCore(kind, name) {
    try {
        let tree
        if (kind === "local") {
            tree = localCore(name)
            if (!tree) return
        } else {
            tree = await fetchTree(remotesOf(plexos.System.user)[name])
            tree.name = name
        }
        downloadJson(name, tree)
    } catch (error) {
        console.error(error)
        landing.logon.append(el("p", "landing-error", `Could not download ${name}.`))
    }
}

function coreActions(open, edit, { clone, download, remove } = {}) {
    const list = [
        { name: "Open", icon: "url('/THEME/icons/interface/contextMenu/open.svg')", func: open },
    ]
    if (clone) list.push({ name: "Clone", icon: "url('/THEME/icons/interface/contextMenu/copy.svg')", func: clone })
    list.push({ name: "Edit", icon: "url('/THEME/icons/interface/contextMenu/rename.svg')", func: edit })
    if (download) list.push({ name: "Download", func: download })
    list.push({ name: "Delete", icon: "url('/THEME/icons/interface/contextMenu/delete.svg')", func: remove })
    return [{ name: "core", list }]
}

function coreRow(label, detail, open, edit, extra) {
    const row = el("button", "landing-core")
    row.type = "button"
    row.append(el("span", null, label))
    if (detail) row.append(el("small", null, detail))
    row.onclick = open
    row.oncontextmenu = event => ContextMenu.open(event, row, coreActions(open, edit, extra))
    return row
}

function labeledField(label) {
    const field = el("label", "landing-field")
    const error = el("p", "landing-error")
    const head = el("div", "landing-field-head")
    head.append(el("span", null, label), error)
    field.append(head)
    return { field, error }
}

function localCore(name) {
    return (plexos.System.user.localCores || []).find(core => core.name === name) || null
}

async function applyCoreTemplate(coreName, choice) {
    const user = plexos.System.user
    let tree
    if (choice.startsWith("remote:")) {
        const remoteName = choice.slice("remote:".length)
        tree = await fetchTree(remotesOf(user)[remoteName])
    } else {
        tree = await bareTree()
    }
    tree.name = coreName
    user.localCores = (user.localCores || []).map(core => core.name === coreName ? tree : core)
    await plexos.db.saveUser(user)
}

function showCoreEditor({ kind, name, fresh = false, freshSource = "" }) {
    const user = plexos.System.user
    const { logon } = landing
    resetLogonPlace()
    const revealId = ++landing.logonReveal
    const reveal = !logon.classList.contains("open")
    logon.replaceChildren()
    logon.dataset.mode = "core-edit"
    logon.dataset.coreTab = kind
    let current = name

    const nameBox = labeledField("Name")
    const nameInput = document.createElement("input")
    nameInput.type = "text"
    nameInput.autocomplete = "off"
    nameInput.value = current
    nameBox.field.append(nameInput)

    let linkInput = null
    let templateSelect = null
    let extra = null
    if (kind === "remote") {
        extra = labeledField("Core link")
        linkInput = document.createElement("input")
        linkInput.type = "text"
        linkInput.autocomplete = "off"
        linkInput.spellcheck = false
        linkInput.value = remotesOf(user)[current] || ""
        extra.field.append(linkInput)
    } else if (fresh === "template") {
        extra = labeledField("Template")
        templateSelect = document.createElement("select")
        templateSelect.append(new Option("Empty core", "empty"))
        extra.field.append(templateSelect)
        let templateChoice = "empty"
        templateSelect.onchange = () => applyFreshChoice(templateSelect, extra.error, () => templateChoice, next => { templateChoice = next })
    } else if (fresh === "remote") {
        extra = labeledField("Remote")
        templateSelect = document.createElement("select")
        const remoteNames = Object.keys(remotesOf(user))
        for (const remoteName of remoteNames) {
            templateSelect.append(new Option(remoteName, `remote:${remoteName}`))
        }
        if (freshSource) templateSelect.value = `remote:${freshSource}`
        extra.field.append(templateSelect)
        let templateChoice = templateSelect.value
        templateSelect.onchange = () => applyFreshChoice(templateSelect, extra.error, () => templateChoice, next => { templateChoice = next })
    }

    const back = el("button", "landing-link", "← go back")
    back.type = "button"
    const nav = el("div", "landing-edit-nav")
    nav.append(back)

    let saving = null
    const commit = () => {
        if (saving) return saving
        const next = nameInput.value.trim()
        if (!next) {
            nameInput.value = current
            nameBox.error.textContent = "A name is required."
            return Promise.resolve("A name is required.")
        }
        if (kind === "remote") {
            const url = linkInput.value.trim()
            if (!url) {
                extra.error.textContent = "A link is required."
                return Promise.resolve("A link is required.")
            }
            const remotes = remotesOf(user)
            if (next === current && url === (remotes[current] || "")) {
                nameBox.error.textContent = ""
                extra.error.textContent = ""
                return Promise.resolve("")
            }
            if (next !== current && remotes[next]) {
                nameBox.error.textContent = "That name is already taken."
                return Promise.resolve("That name is already taken.")
            }
            saving = (async () => {
                delete remotes[current]
                remotes[next] = url
                writeRemotes(user, remotes)
                await plexos.db.saveUser(user)
                current = next
                saving = null
                nameBox.error.textContent = ""
                extra.error.textContent = ""
                return ""
            })().catch(() => {
                saving = null
                nameBox.error.textContent = "Could not save this core."
                return "Could not save this core."
            })
            return saving
        }
        const core = localCore(current)
        if (!core) return Promise.resolve("That core is gone.")
        if (next === current) {
            nameBox.error.textContent = ""
            return Promise.resolve("")
        }
        if ((user.localCores || []).some(other => other.name === next)) {
            nameBox.error.textContent = "That name is already taken."
            return Promise.resolve("That name is already taken.")
        }
        saving = (async () => {
            core.name = next
            await plexos.db.saveUser(user)
            current = next
            saving = null
            nameBox.error.textContent = ""
            return ""
        })().catch(() => {
            saving = null
            nameBox.error.textContent = "Could not save this core."
            return "Could not save this core."
        })
        return saving
    }
    const leave = async () => {
        if (await commit()) return
        showCores(kind)
    }
    nameInput.oninput = () => { nameBox.error.textContent = "" }
    nameInput.onchange = () => commit()
    nameInput.onkeydown = event => {
        if (event.key !== "Enter") return
        event.preventDefault()
        leave()
    }
    if (linkInput) {
        linkInput.oninput = () => { extra.error.textContent = "" }
        linkInput.onchange = () => commit()
        linkInput.onkeydown = event => {
            if (event.key !== "Enter") return
            event.preventDefault()
            leave()
        }
    }
    const applyFreshChoice = (select, error, getChoice, setChoice) => {
        const choice = select.value
        select.disabled = true
        error.textContent = ""
        const failed = fresh === "remote" ? "Could not clone that core." : "Could not apply that template."
        return (async () => {
            try {
                if (await commit()) {
                    select.value = getChoice()
                    return
                }
                await applyCoreTemplate(current, choice)
                setChoice(choice)
            } catch (failure) {
                console.error(failure)
                error.textContent = failed
                select.value = getChoice()
            } finally {
                select.disabled = false
            }
        })()
    }
    back.onclick = () => leave()

    logon.append(nameBox.field)
    if (extra) logon.append(extra.field)
    logon.append(nav)
    if (holdReveal(reveal, revealId)) nameInput.focus()
    nameInput.select()
}

function holdReveal(reveal, revealId) {
    if (!reveal) return true
    landing.logon.classList.remove("open")
    landing.logon.offsetWidth
    requestAnimationFrame(() => {
        if (revealId !== landing.logonReveal) return
        landing.logon.classList.add("open")
    })
    return true
}

function confirmCoreDelete(kind, coreName) {
    const user = plexos.System.user
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
        if (kind === "local") {
            user.localCores = (user.localCores || []).filter(core => core.name !== coreName)
        } else {
            const remotes = remotesOf(user)
            delete remotes[coreName]
            writeRemotes(user, remotes)
        }
        if (user.config?.lastOpenedCore === coreName) user.config.lastOpenedCore = null
        await plexos.db.saveUser(user)
        closePopup()
        showCores(kind)
    }
    actions.append(cancel, ok)
    card.append(el("p", "landing-lead", "Are you sure?"), el("p", "landing-note", "This can't be undone."), actions)
    popup.append(card)
    landing.stage.append(popup)
    landing.popup = popup
}

async function addLocalCore(button) {
    if (landing.addingCore) return
    landing.addingCore = true
    button.disabled = true
    try {
        const user = plexos.System.user
        const names = (user.localCores || []).map(core => core.name)
        const name = uniqueName("core", names)
        const tree = await bareTree()
        tree.name = name
        user.localCores = [...(user.localCores || []), tree]
        await plexos.db.saveUser(user)
        showCoreEditor({ kind: "local", name, fresh: "template" })
    } catch (error) {
        console.error(error)
        button.disabled = false
        landing.logon.append(el("p", "landing-error", "Could not create an empty core."))
    } finally {
        landing.addingCore = false
    }
}

function renderLocal(panel, user) {
    const cores = user.localCores || []
    panel.append(el("p", "landing-note", cores.length ? "Your local cores" : "No local cores yet."))
    const list = el("div", "landing-list")
    for (const core of cores) {
        const name = core.name || "core"
        list.append(coreRow(
            name,
            formatSize(coreBytes(core)),
            () => {
                const stored = localCore(name)
                if (stored) mountTree(stored, { readOnly: false, name })
            },
            () => showCoreEditor({ kind: "local", name }),
            {
                download: () => downloadCore("local", name),
                remove: () => confirmCoreDelete("local", name),
            },
        ))
    }
    const add = el("button", "landing-core add", "Add new core")
    add.type = "button"
    add.onclick = () => addLocalCore(add)
    const clone = el("button", "landing-core add", "Clone remote core")
    clone.type = "button"
    clone.onclick = () => cloneRemoteCore(Object.keys(remotesOf(user))[0], clone)
    panel.append(list, add, clone)
}

async function addRemoteCore(button) {
    if (landing.addingCore) return
    landing.addingCore = true
    button.disabled = true
    try {
        const user = plexos.System.user
        const name = uniqueName("Remote", Object.keys(remotesOf(user)))
        const remotes = remotesOf(user)
        remotes[name] = "https://"
        writeRemotes(user, remotes)
        await plexos.db.saveUser(user)
        showCoreEditor({ kind: "remote", name })
    } catch (error) {
        console.error(error)
        button.disabled = false
        landing.logon.append(el("p", "landing-error", "Could not add a remote core."))
    } finally {
        landing.addingCore = false
    }
}

async function cloneRemoteCore(source, button) {
    if (landing.addingCore) return
    const user = plexos.System.user
    const remotes = remotesOf(user)
    if (!remotes[source]) {
        landing.logon.append(el("p", "landing-error", "There is no remote core to clone."))
        return
    }
    landing.addingCore = true
    if (button) button.disabled = true
    try {
        const names = (user.localCores || []).map(core => core.name)
        const name = uniqueName(source, names)
        const tree = await fetchTree(remotes[source])
        tree.name = name
        user.localCores = [...(user.localCores || []), tree]
        await plexos.db.saveUser(user)
        showCoreEditor({ kind: "local", name, fresh: "remote", freshSource: source })
    } catch (error) {
        console.error(error)
        if (button) button.disabled = false
        landing.logon.append(el("p", "landing-error", "Could not clone that core."))
    } finally {
        landing.addingCore = false
    }
}

function renderRemote(panel, user) {
    panel.append(el("p", "landing-note", "A remote core opens read-only."))
    const list = el("div", "landing-list")
    for (const [name, url] of Object.entries(remotesOf(user))) {
        list.append(coreRow(
            name,
            url,
            async () => {
                try {
                    const tree = await fetchTree(remotesOf(user)[name] || url)
                    tree.name = name
                    await mountTree(tree, { readOnly: true, name })
                } catch (error) {
                    console.error(error)
                    panel.append(el("p", "landing-error", `Could not open ${name}.`))
                }
            },
            () => showCoreEditor({ kind: "remote", name }),
            {
                clone: () => cloneRemoteCore(name),
                download: () => downloadCore("remote", name),
                remove: () => confirmCoreDelete("remote", name),
            },
        ))
    }
    const add = el("button", "landing-core add", "Add new core")
    add.type = "button"
    add.onclick = () => addRemoteCore(add)
    panel.append(list, add)
}

export function showCores(tab) {
    const user = plexos.System.user
    const { logon } = landing
    resetLogonPlace()
    const revealId = ++landing.logonReveal
    const reveal = !logon.classList.contains("open")
    logon.replaceChildren()
    logon.classList.add("cores")
    logon.dataset.mode = "cores"
    const tabs = el("div", "landing-tabs")
    const localTab = el("button", tab === "local" ? "landing-tab on" : "landing-tab", "Local")
    const remoteTab = el("button", tab === "remote" ? "landing-tab on" : "landing-tab", "Remote")
    localTab.type = "button"
    remoteTab.type = "button"
    localTab.onclick = () => showCores("local")
    remoteTab.onclick = () => showCores("remote")
    tabs.append(localTab, remoteTab)
    logon.append(tabs)
    if (tab === "remote") renderRemote(logon, user)
    else renderLocal(logon, user)
    fitCoreMenu()
    if (!reveal) return
    // Paint at opacity 0 first, then fade. A single frame would skip the transition.
    logon.classList.remove("open")
    logon.offsetWidth
    requestAnimationFrame(() => {
        if (revealId !== landing.logonReveal) return
        logon.classList.add("open")
    })
}
