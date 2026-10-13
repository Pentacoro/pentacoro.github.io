export default function constructWindow(win) {
    const newWindow = document.createElement("div")
    newWindow.setAttribute("class", "window " + win.task + " " + win.wid)
    newWindow.classList.add("building")
    newWindow.setAttribute("id", "window_" + win._windowIndex)

    const newWindowInner = document.createElement("div")
    newWindowInner.setAttribute("class", "windowInner")
    newWindow.appendChild(newWindowInner)
    win.keyNodes.innerDrawing = newWindowInner

    const newHeader = document.createElement("div")
    newHeader.setAttribute("class", "header")
    newWindowInner.appendChild(newHeader)
    win.keyNodes.windowHeader = newHeader
    win.keyNodes.dragElements.push(newHeader)

    const newHeaderBackground = document.createElement("div")
    newHeaderBackground.setAttribute("class", "headerBackground sys-chrome")
    newHeader.appendChild(newHeaderBackground)

    if (win.icon) {
        const newHeaderIcon = document.createElement("img")
        newHeaderIcon.setAttribute("class", "headerIcon")
        newHeaderIcon.setAttribute("src", win.icon)
        newHeader.appendChild(newHeaderIcon)
        win.keyNodes.image = newHeaderIcon
    }

    const newHeaderText = document.createElement("span")
    newHeaderText.setAttribute("class", "headerText")
    newHeader.appendChild(newHeaderText)
    newHeaderText.appendChild(document.createTextNode(win.name))
    win.keyNodes.title = newHeaderText

    const newHeaderButtons = document.createElement("div")
    newHeaderButtons.setAttribute("class", "headerButtons")
    newHeader.appendChild(newHeaderButtons)
    win.keyNodes.buttonPocket = newHeaderButtons

    for (const button of win.appParams.buttons) {
        const newWindowButton = document.createElement("button")
        if (button.class) newWindowButton.setAttribute("class", `windowButton ${button.class}`)
        if (button.image) newWindowButton.style.backgroundImage = button.image
        newWindowButton._themeAction = button.function
        win.keyNodes.buttonPocket.appendChild(newWindowButton)
    }

    if (win.appParams.minimizeable) {
        const buttonMinimize = document.createElement("button")
        buttonMinimize.setAttribute("class", "windowButton _")
        win.keyNodes.buttonPocket.appendChild(buttonMinimize)
        win.keyNodes.buttons.minimize = buttonMinimize
    }

    if (win.appParams.maximizeable) {
        const buttonMaximize = document.createElement("button")
        buttonMaximize.setAttribute("class", "windowButton O")
        win.keyNodes.buttonPocket.appendChild(buttonMaximize)
        win.keyNodes.buttons.maximize = buttonMaximize
    }

    const buttonClose = document.createElement("button")
    buttonClose.setAttribute("class", "windowButton X")
    win.keyNodes.buttonPocket.appendChild(buttonClose)
    win.keyNodes.buttons.close = buttonClose

    const newContent = document.createElement("div")
    newContent.setAttribute("class", "content")
    newWindowInner.appendChild(newContent)
    win.keyNodes.content = newContent

    const newWindowBorder = document.createElement("div")
    newWindowBorder.setAttribute("class", "windowBorder")
    newWindow.appendChild(newWindowBorder)

    if (win.appParams.resizeable) {
        newWindow.classList.add("resizeable")
        const edges = [
            ["windowEdge", "windowEtop"],
            ["windowEdge", "windowEbot"],
            ["windowEdge", "windowElef"],
            ["windowEdge", "windowErig"],
            ["windowCorner", "windowCtl"],
            ["windowCorner", "windowCtr"],
            ["windowCorner", "windowCbr"],
            ["windowCorner", "windowCbl"],
        ]
        for (const [kind, name] of edges) {
            const el = document.createElement("div")
            el.setAttribute("class", `${kind} ${name}`)
            newWindowBorder.appendChild(el)
        }
    }

    const modalShield = document.createElement("div")
    modalShield.setAttribute("class", "windowModalShield")
    newWindow.appendChild(modalShield)
    win.keyNodes.modalShield = modalShield

    document.getElementById("windowLayer").appendChild(newWindow)
    win.node = newWindow
    win.cont = newContent
}
