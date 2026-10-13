import plexos from "/plexos/ini/system.js"

export function themeName() {
    return plexos.Settings?.system?.theme || "Plexos Hyper"
}

export function themeRoot() {
    return `/plexos/res/themes/${themeName()}`
}

export function themeConstruct(kind, ...args) {
    const constructor = plexos.Theme?.constructors?.[kind]
    if (typeof constructor === "function") return constructor(...args)
    if (constructor && typeof constructor === "object") return constructor
    throw new Error(`Theme constructor '${kind}' is not loaded`)
}

export function applyThemeFavicon() {
    const link = document.querySelector("link[rel='icon']")
    if (link) link.href = `${themeRoot()}/icons/plexos/Plexos 4.png`
}

export async function loadThemeConstructors() {
    const root = themeRoot()
    const kinds = ["window", "contextMenu", "desktopIcon", "explorerIcon", "dragShip", "controls"]
    const constructors = {}
    for (const kind of kinds) {
        constructors[kind] = (await import(`${root}/constructors/${kind}.js`)).default
    }
    plexos.Theme = {
        name: themeName(),
        root,
        constructors,
    }
    return plexos.Theme
}
