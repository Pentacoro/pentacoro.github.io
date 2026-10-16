// How Hyper shows desktop icons being dragged. The real icons stay in their cells,
// hidden, while clones on the drag layer follow the cursor. The desktop keeps
// icon.coords current; this only draws. A theme without this file leaves the icons in place.

export default function constructDesktopDrag(icons, { layer }) {
    const ghosts = icons.filter(icon => icon.node).map(icon => {
        const clone = icon.node.cloneNode(true)
        clone.removeAttribute("id")
        clone.classList.add("moving")
        clone.classList.remove("highlight")
        clone.style.pointerEvents = "none"
        layer.appendChild(clone)
        icon.node.style.visibility = "hidden"
        return { icon, clone }
    })

    function move() {
        for (const { icon, clone } of ghosts) {
            clone.style.left = icon.coords.tx + "px"
            clone.style.top = icon.coords.ty + "px"
        }
    }

    function end() {
        for (const { icon, clone } of ghosts) {
            clone.remove()
            if (icon.node) icon.node.style.visibility = ""
        }
    }

    move()
    return { move, end }
}
