var envfocus  = {}

function deleteSelectedNodes(pocket){
    for(icon of pocket){
        let getFile = addressInterpreter(icon.file)

        icon.deleteNode()

        //delete from filesystem
        getFile.deleteMe()
    }
}