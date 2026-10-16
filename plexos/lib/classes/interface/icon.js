import File from "../filesystem/file.js"
import {themeConstruct, themeRoot} from "../../functions/theme.js"
import {cachedIconFile, isIconFile, loadIconFile} from "../../functions/iconFile.js"

const stickerSlots = ["nw", "n", "ne", "w", "c", "e", "sw", "s", "se"]
export const iconStickerSlots = stickerSlots
export const iconSizes = [16, 32, 48, 128, 256]
const renderModes = new Set(["auto", "pixelated", "smooth"])
// Small rasters can float at their own pixel size. Off until that is a setting.
const floatSmallRasters = false

export function fitIconSize(space) {
    const room = Math.floor(space)
    let fit = iconSizes[0]
    for (const size of iconSizes) {
        if (size <= room) fit = size
        else break
    }
    return fit
}

function readSizes(sizes) {
    const stored = {}
    if (!sizes || typeof sizes !== "object") return stored
    for (const [key, url] of Object.entries(sizes)) {
        const px = Number(key)
        if (px > 0 && typeof url === "string" && url) stored[px] = url
    }
    return stored
}

function readStickers(stickers) {
    const stored = {}
    if (!stickers || typeof stickers !== "object") return stored
    for (const slot of stickerSlots) {
        const value = stickers[slot]
        if (typeof value === "string" && value) stored[slot] = { url: value, render: "auto" }
        else if (value && typeof value.url === "string" && value.url) {
            stored[slot] = { url: value.url, render: renderModes.has(value.render) ? value.render : "auto" }
        }
    }
    return stored
}

function isSvgUrl(url) {
    return /\.svg(?:$|[?#])/i.test(url || "") || /^data:image\/svg\+xml/i.test(url || "")
}
function absoluteUrl(url) {
    try { return new URL(url, location.href).href } catch { return "" }
}
function rasterSide(img, url) {
    if (!img?.complete || isSvgUrl(url) || isSvgUrl(img.currentSrc || img.src)) return null
    if (url && absoluteUrl(img.currentSrc || img.src) !== absoluteUrl(url)) return null
    const side = Math.max(img.naturalWidth || 0, img.naturalHeight || 0)
    return side > 0 ? side : null
}

function readLayers(layers) {
    if (!Array.isArray(layers)) return null
    return layers.filter(item => item && typeof item.url === "string" && item.url).map(item => ({
        url: item.url,
        name: typeof item.name === "string" ? item.name : "",
        x: Number(item.x) || 0,
        y: Number(item.y) || 0,
        w: Number(item.w) > 0 ? Number(item.w) : 32,
        h: Number(item.h) > 0 ? Number(item.h) : (Number(item.w) > 0 ? Number(item.w) : 32),
        skewX: Number.isFinite(Number(item.skewX)) ? Number(item.skewX) : 0,
        skewY: Number.isFinite(Number(item.skewY)) ? Number(item.skewY) : 0,
    }))
}

export default class Icon {
    state = 0
    constructor(p){
        this.state = p.state || this.state
        this.image = p.image || p.imag
        this.class = p.class
        this.name = p.name
        this.file = p.file || ""
        this.exte = p.exte || ((this.class==="DirectoryFile") ? "dir" : (this.name.match(/\.(?:.(?<!\.))+$/s)!=null) ? this.name.match(/(?:.(?<!\.))+$/s)[0] : "")
        this.sizes = readSizes(p.sizes)
        this.render = renderModes.has(p.render) ? p.render : "auto"
        this.stickers = readStickers(p.stickers)
        const layers = readLayers(p.layers)
        if (layers) this.layers = layers
        if (p.layered === true || p.layered === false) this.layered = p.layered

        this.drop = []
    }
    isFolder() {
        if (this.exte === "can") return false // the bin has its own empty and full pictures, never layered art
        return this.class === "DirectoryFile" || this.exte === "dir"
    }
    isLayered() {
        if (this.layered === false) return false
        if (this.layered === true) return true
        return this.isFolder()
    }
    folderDir() {
        if (!this.isFolder()) return null
        try {
            const dir = File.at(this.file)?.dir
            if (!dir || typeof dir !== "object" || Array.isArray(dir)) return null
            return dir
        } catch {
            return null
        }
    }
    // px is the size being drawn, so the theme can draw a small folder plainly
    folderArt(px = null) {
        if (!this.isFolder() || !this.isLayered()) return null
        if (this.image && !isIconFile(this.image)) return null
        if (isIconFile(this.image)) {
            const doc = cachedIconFile(this.image)
            if (doc?.layered === false) return null
            if (doc?.image && doc.layered !== true) return null
        }
        try {
            const built = themeConstruct("folderIcon", this, null, px)
            if (!built || typeof built !== "object") return null
            return built
        } catch {
            return null
        }
    }
    setImage(url){
        this.image = url
        File.at(this.file).render()
    }
    getImage(){
        if (this.image && !isIconFile(this.image)) return this.image
        if (isIconFile(this.image)) {
            const doc = this.iconDocument()
            if (doc?.image && !(doc.layered === true && this.isFolder())) return doc.image
        }

        switch (this.exte) {
            case "dir":
                try {
                    const plain = themeConstruct("folderIcon", this, "plain")
                    if (typeof plain === "string" && plain) return plain
                } catch { /* the theme is not loaded yet */ }
                if (Object.keys(File.at(this.file)?.dir || {}).length > 0) return `${themeRoot()}/icons/files/images/folder-filled.svg`
                else return `${themeRoot()}/icons/files/images/folder.svg`
            case "can":
                if (File.at(this.file)?.dir?.length > 0) return `${themeRoot()}/icons/files/images/trash-full.svg`
                else return `${themeRoot()}/icons/files/images/trash.svg`
            case "txt" || "js" || "css" || "html":
                return `${themeRoot()}/icons/files/images/text.svg`
            case "proxy":
                return `${themeRoot()}/icons/files/images/proxy.svg`
            case "meta":
                return `${themeRoot()}/icons/files/images/meta.svg`
            case "web":
                return File.at(this.file)?.meta?.icon || `${themeRoot()}/icons/files/images/file.svg`
            case "img":
                return File.at(this.file)?.meta?.url || `${themeRoot()}/icons/files/images/file.svg`
            default:
                return `${themeRoot()}/icons/files/images/file.svg`
        }
    }
    iconDocument() {
        if (!isIconFile(this.image)) return null
        const doc = cachedIconFile(this.image)
        if (doc) return doc
        const url = this.image
        if (this._iconPull === url) return null
        this._iconPull = url
        loadIconFile(url).then(loaded => {
            if (this.image !== url || !loaded) return
            try { File.at(this.file)?.render?.() } catch { /* the file may already be gone */ }
        }).catch(() => {})
        return null
    }
    // Smallest stored frame that covers the container. Larger than every frame uses the largest.
    imageFor(px) {
        const frames = Object.entries(this.sizes)
            .map(([size, url]) => [Number(size), url])
            .sort((a, b) => a[0] - b[0])
        if (!frames.length) return { url: this.baseUrl(px), native: null }
        const cover = frames.find(([size]) => size >= px)
        const chosen = cover || frames[frames.length - 1]
        return { url: chosen[1], native: chosen[0] }
    }
    baseUrl(px = null) {
        const art = this.folderArt(px)
        if (art?.image) return art.image
        return this.getImage()
    }
    placement(containerPx, measured) {
        const px = Math.max(1, Math.round(containerPx))
        const frame = this.imageFor(px)
        const native = frame.native != null ? frame.native : (measured > 0 ? measured : null)
        const mode = this.render || "auto"
        if (!floatSmallRasters || native == null) return { url: frame.url, drawn: px, pixelated: mode === "pixelated" }
        if (mode === "smooth") return { url: frame.url, drawn: px, pixelated: false }
        if (mode === "pixelated") return { url: frame.url, drawn: this.drawnSize(native, px), pixelated: true }
        if (native === px) return { url: frame.url, drawn: px, pixelated: true }
        if (native < px && native * 2 >= px) return { url: frame.url, drawn: native, pixelated: true }
        if (native * 2 < px) return { url: frame.url, drawn: Math.round(px / 2), pixelated: false }
        return { url: frame.url, drawn: px, pixelated: false }
    }
    drawnSize(native, px) {
        if (native === px) return px
        if (native < px && native * 2 >= px) return native
        if (native * 2 < px) return Math.round(px / 2)
        return px
    }
    layerItems() {
        if (Array.isArray(this.layers)) return this.layers
        return this.folderArt()?.layers || []
    }
    ensureLayers() {
        if (!Array.isArray(this.layers)) this.layers = this.layerItems().map(item => ({ ...item }))
        return this.layers
    }
    stickerList() {
        return stickerSlots.map(slot => this.stickers[slot]?.url || "")
    }
    paint(nodes, containerPx) {
        if (!nodes?.image || !nodes?.art) return
        const frame = this.imageFor(containerPx)
        let place = this.placement(containerPx, rasterSide(nodes.image, frame.url))
        const apply = (next) => {
            nodes.art.style.width = next.drawn + "px"
            nodes.art.style.height = next.drawn + "px"
            nodes.image.style.imageRendering = next.pixelated ? "pixelated" : "auto"
        }
        apply(place)
        nodes.image.src = place.url || ""
        if (frame.native == null && !isSvgUrl(place.url)) {
            const fitted = rasterSide(nodes.image, place.url)
            if (fitted != null) {
                place = this.placement(containerPx, fitted)
                apply(place)
            } else if (!nodes.image.complete) {
                const img = nodes.image
                const url = place.url
                if (img._iconFit) img.removeEventListener("load", img._iconFit)
                img._iconFit = () => {
                    const side = rasterSide(img, url)
                    if (side == null) return
                    apply(this.placement(containerPx, side))
                }
                img.addEventListener("load", img._iconFit, { once: true })
            }
        }

        if (nodes.layers) {
            nodes.layers.replaceChildren()
            nodes.layers.style.inset = "0"
            nodes.layers.style.display = "block"
            const art = this.folderArt(containerPx)
            const items = art?.small ? [] : this.layerItems()
            const placeLayer = (item, index) => {
                const box = document.createElement("span")
                const sizeW = item.w > 0 ? item.w : 32
                const sizeH = item.h > 0 ? item.h : sizeW
                const skewX = Number.isFinite(Number(item.skewX)) ? Number(item.skewX) : 0
                const skewY = Number.isFinite(Number(item.skewY)) ? Number(item.skewY) : 0
                box.className = "iconLayer"
                box.dataset.index = String(index)
                box.dataset.skewX = String(skewX)
                box.dataset.skewY = String(skewY)
                box.style.position = "absolute"
                box.style.left = item.x + "%"
                box.style.top = item.y + "%"
                box.style.width = sizeW + "%"
                box.style.height = sizeH + "%"
                box.style.transformOrigin = "center"
                if (skewX || skewY) box.style.transform = `skewX(${skewX}deg) skewY(${skewY}deg)`
                const layer = document.createElement("img")
                layer.draggable = false
                layer.src = item.url
                box.append(layer)
                nodes.layers.append(box)
            }
            const cover = Number.isInteger(art?.cover) ? art.cover : null
            if (cover != null && items[cover]) {
                for (let index = items.length - 1; index >= 0; index--) {
                    if (index !== cover) placeLayer(items[index], index)
                }
                placeLayer(items[cover], cover)
            } else {
                items.forEach((item, index) => placeLayer(item, index))
            }
            if (nodes.front) {
                nodes.front.style.display = art?.front ? "block" : "none"
                if (art?.front) nodes.front.src = art.front
            }
        } else if (nodes.front) {
            nodes.front.style.display = "none"
        }
        if (nodes.stickers) {
            nodes.stickers.replaceChildren()
            for (const slot of stickerSlots) {
                const item = this.stickers[slot]
                const cell = document.createElement("span")
                cell.className = "iconSticker"
                if (item?.url) {
                    const sticker = document.createElement("img")
                    sticker.src = item.url
                    sticker.draggable = false
                    if (item.render === "pixelated") sticker.style.imageRendering = "pixelated"
                    if (item.render === "smooth") sticker.style.imageRendering = "auto"
                    cell.append(sticker)
                }
                nodes.stickers.append(cell)
            }
        }
    }
}
