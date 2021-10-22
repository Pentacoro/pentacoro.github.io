var core = new Directory ("core")

core.createNewDir   (
                        "Vertex 1",  
                        {
                            icon : new Icon ("background-image: url('assets/svg/desktopIcons/folderPlaceholder.svg');", "Vertex 1", "vertex", 0),
                            from : core,
                            type : "dir",
                            vert : true
                        }
                    )

var currentVertex = core.cont["Vertex 1"]

core.cont["Vertex 1"].createNewDir("Folder 1")
core.cont["Vertex 1"].createNewDir("Folder 2")
core.cont["Vertex 1"].createNewDir("Folder 3")


//future init function
/*
for ([key,value] of Object.entries(core.cont["Vertex 1"].cont)) {
    iconArray.push(value.conf.icon)
    value.conf.icon.createNode()
}
*/
