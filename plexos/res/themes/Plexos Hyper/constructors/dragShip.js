export default function constructDragShip({ count, image, layer, x, y }) {
    const node = document.createElement("div")
    node.setAttribute("class", "iconShip")

    const countBox = document.createElement("div")
    countBox.setAttribute("class", "iconShipSize")
    const countText = document.createElement("span")
    countText.textContent = count
    countBox.appendChild(countText)

    const imageBox = document.createElement("div")
    imageBox.setAttribute("class", "iconShipImg")
    if (count === 1) {
        imageBox.style.backgroundImage = `url('${image}')`
        imageBox.style.backgroundSize = "68%"
    } else {
        const stack = new URL(`../icons/interface/fileDrag/pocket_ship_${Math.min(count, 3)}.svg`, import.meta.url)
        imageBox.style.backgroundImage = `url('${stack.href}')`
    }

    node.appendChild(countBox)
    node.appendChild(imageBox)
    if (x != null) node.style.left = x + "px"
    if (y != null) node.style.top = y + "px"
    layer.appendChild(node)

    return { node, keyNodes: { image: imageBox, count: countText } }
}
