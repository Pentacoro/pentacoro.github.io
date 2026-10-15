// How Hyper builds a folder icon. Another theme supplies its own file:
// how many child icons to show, where they sit, and which pictures form the shell.

const previewCount = 2

const stockIconNames = new Set([
    "folder.svg", "folder-filled.svg", "folder-packed.svg", "folder-back.svg", "folder-front.svg",
    "paper-back.svg", "paper-middle.svg", "paper-front.svg",
    "text.svg", "meta.svg", "file.svg", "proxy.svg", "placeholder.svg",
    "stash.svg", "stash-full.svg", "trash.svg", "trash-full.svg", "vertex.svg",
])

function image(name) {
    return new URL(`../icons/files/images/${name}`, import.meta.url).href
}

function fileName(url) {
    if (typeof url !== "string" || !url) return ""
    return decodeURIComponent(url.split("/").pop().split("?")[0])
}

function isStock(file) {
    const icon = file?.cfg?.icon
    if (!icon) return true
    if (icon.image) return false
    const kind = file.cfg?.class
    if (kind === "DirectoryFile" || kind === "StringFile") return true
    try {
        return stockIconNames.has(fileName(icon.getImage?.()))
    } catch {
        return true
    }
}

function plain(icon) {
    let filled = false
    try {
        const dir = icon?.folderDir?.()
        filled = !!(dir && Object.keys(dir).length > 0)
    } catch { /* an unmounted folder draws empty */ }
    return image(filled ? "folder-filled.svg" : "folder.svg")
}

function childIcons(icon) {
    const dir = icon?.folderDir?.()
    if (!dir) return []
    const urls = []
    for (const child of Object.values(dir)) {
        if (isStock(child)) continue
        const childIcon = child?.cfg?.icon
        if (!childIcon?.getImage) continue
        try {
            const url = childIcon.getImage()
            if (url) urls.push(url)
        } catch { /* a child without a mounted file keeps the folder plain */ }
        if (urls.length === previewCount) break
    }
    return urls
}

function layout(urls) {
    if (urls.length < 2) {
        return urls.map(url => ({ url, x: 8, y: 12, w: 76, h: 76, skewX: -8, skewY: 0 }))
    }
    return [
        { url: urls[0], x: 20, y: 18, w: 70, h: 70, skewX: -8, skewY: 0 },
        { url: urls[1], x: 6, y: 12, w: 66, h: 66, skewX: 0, skewY: 0 },
    ]
}

function build(icon) {
    const saved = Array.isArray(icon?.layers) ? icon.layers : null
    const layers = saved || layout(childIcons(icon))
    const picture = plain(icon)
    if (!layers.length) return { image: picture, front: "", layers: [], cover: null }
    return {
        image: image("folder-back.svg"),
        front: image("folder-front.svg"),
        layers,
        cover: 0,
    }
}

export default function folderIcon(icon, mode) {
    if (mode === "plain") return plain(icon)
    return build(icon)
}
