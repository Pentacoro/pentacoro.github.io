cfg.desktop.grid = JSON.parse(File.at("/config/desktop/grid.json").data)
system.ini.setVertex("/vertex")

window.onbeforeunload = (e) => {
    e.preventDefault()
    return false
}