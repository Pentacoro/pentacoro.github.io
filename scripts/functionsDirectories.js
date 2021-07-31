var core = new Directory ("core")

core.cont.push(new Directory("vertex1"))

core.cont[0].cont.push(new Directory(
    "Folder 1",
    {
        icon : new Icon ("background-image: url('assets/svg/desktopIcons/folderPlaceholder.svg');", "Folder 1", "explorer", 0, 12, 12)
    }
))
core.cont[0].cont.push(new Directory(
    "Folder 2",
    {
        icon : new Icon ("background-image: url('assets/svg/desktopIcons/folderPlaceholder.svg');", "Folder 2", "explorer", 0, 12, 12)
    }
))
core.cont[0].cont.push(new Directory(
    "Folder 3",
    {
        icon : new Icon ("background-image: url('assets/svg/desktopIcons/folderPlaceholder.svg');", "Folder 3", "explorer", 0, 12, 12)
    }
))
core.cont[0].cont.push(new Executable(
    "./apps/settings_deskGrid/deskGridOptions_launch.html",
    "Desk Grid Settings",
    {
        icon : new Icon ("background-image: url('assets/svg/desktopIcons/settingsPlaceholder.svg');", "Desk Grid Settings", "exe", 0, 12, 12)
    }
))

for (item of core.cont[0].cont) {
    iconArray.push(item.conf.icon)
    item.conf.icon.createNode()
}
