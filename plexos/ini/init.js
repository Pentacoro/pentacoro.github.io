import {plexos} from "./system.js"
import File from "/plexos/lib/classes/filesystem/file.js"

export default function initialize() {
    plexos.System.ini.openDesktop("/user/desks/desktop")
    console.log(plexos)
    console.log(plexos.System.core)
}