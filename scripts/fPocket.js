var envfocus  = {}

function deleteSelectedNodes(pocket){
    let iconsToDelete = pocket
    for(icon of iconsToDelete){
        icon.deleteNode()

        //delete from filesystem
        let getFile = addressInterpreter(icon.file)
        getFile.deleteMe()
    }
}