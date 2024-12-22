import {getTask} from "/plexos/lib/functions/dll.js"

let task = getTask(/TASKID/)
let mem  = task.mem

mem.disabledIframe = [
    "https://stackoverflow.com/",
    "https://www.google.com/",
    "https://www.youtube.com/",
    "https://bsky.app/",
    "https://x.com/",
    "https://pinterest.com/"
]