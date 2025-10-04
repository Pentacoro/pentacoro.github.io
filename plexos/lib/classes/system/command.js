import File from "../filesystem/file.js"
import Task from "./task.js"

export class Command {
    constructor(cmd) {
        this.author = cmd.author
        this.command = cmd.command 
        this.arguments = cmd.arguments
        this.timestamp = Date.now()
        this.status = "queried" //queried - running - success - failure
        this.message = ""
    }

    static run(cmd) {
        const args = cmd.arguments
        switch (cmd.command) {
            case ("file.create") :
                File.create({...args})
                break
            case ("file.read") :
                File.read({...args})
                break
            case ("file.write") :
                File.write({...args})
                break
            case ("file.modify") :
                File.modify({...args})
                break
            case ("file.delete") :
                File.delete({...args})
                break
            case ("file.move") :
                File.move({...args})
                break
            case ("file.rename") :
                File.rename({...args})
                break
            case ("task.emit") :
                Task.emit({...args})
                break
            case ("task.listen") :
                Task.listen({...args})
                break
            case ("task.launch") :
                Task.launch({...args})
                break
        }
    }
}