import plexos from "../../../ini/system.js"
import File from "../filesystem/file.js"
import Task from "./task.js"

export default class Command {
    constructor(cmd) {
        Object.assign(this, {
            appID: cmd.appID,
            author: cmd.author,
            command: cmd.command,
            arguments: cmd.arguments,
            timestamp: Date.now(),
            status: "queried",
            message: ""
        })
    }

    static hasPermission(required, permissions) {
        const generic = required.split('.')[0] // "file.modify" also matches catalog "file"
        return permissions.includes(required) || permissions.includes(generic)
    }

    static snapshot(path) { // plain JSON clone for the changelog, never the live Task/Proxy
        const file = File.at(path)
        return file ? File.serializeNode(file) : null
    }

    static authorFor(cmd) {
        const registry = plexos.Core.registry
        let appName = cmd.author
        try {
            if (cmd.appID && registry) appName = registry.resolveIndex(cmd.appID).name
        } catch {
            appName = cmd.author
        }
        const explorerID = registry?.tryGetAppID("Explorer")
        const isExplorer = cmd.appID && explorerID && cmd.appID === explorerID // Explorer edits count as the user
        return {
            user: isExplorer ? (plexos.System.user?.name || null) : null,
            appID: cmd.appID || null,
            app: appName || null,
            taskId: cmd.taskId || null,
        }
    }

    static async run(cmd) {
        const commandMap = {
            // ask(app) => permission dialog copy; msg => success log line
            'file.create': {
                fn: (args) => File.create({
                    path: args.path,
                    Type: args.Type || args.type,
                    name: args.name,
                    icon: args.icon || args.newFileIcon,
                    conf: args.conf,
                    content: args.content ?? args.cont,
                }),
                msg: (args) => `File created at ${args.path || 'unknown'}`,
                ask: (app) => `${app} is requesting permission to create files.`,
                snapshotPath: (args, result) => result?.cfg?.path || (args.path + "/" + args.name),
            },
            'file.read': {
                fn: (args) => File.read({ path: args.path }),
                msg: () => 'File read successfully',
                ask: (app) => `${app} is requesting permission to read files.`,
            },
            'file.write': {
                fn: (args) => File.write({ path: args.path, data: args.data ?? args.content }),
                msg: () => 'File written successfully',
                ask: (app) => `${app} is requesting permission to write to files.`,
            },
            'file.modify': {
                fn: (args) => File.modify({
                    path: args.path,
                    data: args.data ?? args.content ?? args.sys,
                    cfg: args.cfg,
                }),
                msg: () => 'File modified successfully',
                ask: (app) => `${app} is requesting permission to modify files.`,
            },
            'file.delete': {
                fn: (args) => File.delete({ path: args.path }),
                msg: () => 'File deleted successfully',
                ask: (app) => `${app} is requesting permission to delete files.`,
            },
            'file.move': {
                fn: (args) => File.move({ path: args.path, to: args.to || args.newPath }),
                msg: () => 'File moved successfully',
                ask: (app) => `${app} is requesting permission to move files.`,
            },
            'file.rename': {
                fn: (args) => File.rename({ path: args.path, rename: args.rename || args.newName }),
                msg: () => 'File renamed successfully',
                ask: (app) => `${app} is requesting permission to rename files.`,
            },
            'task.launch': {
                fn: Task.launch,
                msg: () => 'Task launched successfully',
                ask: (app) => `${app} is requesting permission to launch applications.`,
            },
            'event.on': {
                fn: (args) => {
                    const task = Task.id(args.taskId)
                    if (!task) throw new Error('Task not found')
                    const eventName = args.eventName
                    const callback = args.callback
                    const priority = args.priority || 0
                    const id = args.taskId
                    Task.System().bus.on(eventName, callback, priority, id)
                    task.globalListeners.push({ eventName, callback, id })
                },
                msg: () => '',
                ask: (app) => `${app} is requesting permission to listen to global events.`,
            },
            'event.off': {
                fn: (args) => {
                    const task = Task.id(args.taskId)
                    if (!task) throw new Error('Task not found')
                    const eventName = args.eventName
                    const callback = args.callback
                    const id = args.taskId
                    Task.System().bus.off(eventName, callback, id)
                    task.globalListeners = task.globalListeners.filter(l => !(l.eventName === eventName && l.callback === callback))
                },
                msg: () => '',
                ask: (app) => `${app} is requesting permission to stop listening to global events.`,
            },
            'event.once': {
                fn: (args) => {
                    const task = Task.id(args.taskId)
                    if (!task) throw new Error('Task not found')
                    const eventName = args.eventName
                    const callback = args.callback
                    const priority = args.priority || 0
                    const id = args.taskId
                    const wrapper = (...eventArgs) => {
                        callback(...eventArgs)
                        Task.System().bus.off(eventName, wrapper, id)
                        task.globalListeners = task.globalListeners.filter(l => !(l.eventName === eventName && l.callback === wrapper))
                    }
                    Task.System().bus.on(eventName, wrapper, priority, id)
                    task.globalListeners.push({ eventName, callback: wrapper, id })
                },
                msg: () => '',
                ask: (app) => `${app} is requesting permission to listen to global events.`,
            },
            'event.emit': {
                fn: (args) => {
                    Task.System().bus.emit(args.eventName, ...(args.args || []))
                },
                msg: () => '',
                ask: (app) => `${app} is requesting permission to send global events.`,
            }
        }

        cmd.status = "running"

        try {
            const command = commandMap[cmd.command]
            if (!command) throw new Error(`Unknown command: ${cmd.command}`)

            const registry = plexos.Core.registry
            let permissions = []
            let prohibitions = []
            if (cmd.appID && registry) {
                try {
                    const params = registry.getAppParams(cmd.appID)
                    permissions = params?.systemPermissions || []
                    prohibitions = params?.systemProhibitions || []
                } catch (e) {
                    console.error(e)
                }
            }

            const requiredPermission = cmd.command.startsWith('event.') ? 'event' : cmd.command // all event.* share one grant

            if (prohibitions.length > 0 && Command.hasPermission(requiredPermission, prohibitions)) {
                cmd.status = "failure"
                cmd.message = `Forbidden from ${requiredPermission}`
                return null
            }

            if (permissions.length > 0 && !Command.hasPermission(requiredPermission, permissions)) {
                const actor = Task.id(cmd.taskId) || Task.System()
                const appName = Command.authorFor(cmd).app || "This application"
                const prompt = command.ask
                    ? command.ask(appName)
                    : `${appName} is requesting permission to ${requiredPermission}.`
                const granted = await actor.askPermission(cmd.appID || cmd.author, requiredPermission, prompt)
                if (!granted) {
                    cmd.status = "failure"
                    cmd.message = `Permission denied for ${requiredPermission}`
                    return null
                }
            }

            const isFileCmd = cmd.command.startsWith("file.") && cmd.command !== "file.read"
            const skipLog = cmd.arguments?.fromHistory // undo/redo must not append another changelog entry
            let before = null
            if (isFileCmd && !skipLog && cmd.command !== "file.create") {
                before = Command.snapshot(cmd.arguments.path)
            }

            const result = await command.fn({ ...cmd.arguments, author: cmd.author, taskId: cmd.taskId })
            cmd.status = "success"
            cmd.message = command.msg(cmd.arguments)

            if (isFileCmd && !skipLog && plexos.Core.changeLog) {
                const type = cmd.command.slice("file.".length)
                const resultPath = result?.cfg?.path
                    || (type === "rename" ? (File.dirname(cmd.arguments.path) + "/" + (cmd.arguments.rename || cmd.arguments.newName)) : null)
                    || (type === "move" ? ((cmd.arguments.to || cmd.arguments.newPath) + "/" + File.basename(cmd.arguments.path)) : null)
                    || cmd.arguments.path
                const after = (type === "delete") ? null : Command.snapshot(resultPath)
                plexos.Core.changeLog.append({
                    type,
                    path: resultPath,
                    oldPath: (type === "rename" || type === "move") ? cmd.arguments.path : null,
                    before,
                    after,
                    timestamp: cmd.timestamp,
                    author: Command.authorFor(cmd),
                })
            }

            return result
        } catch (error) {
            cmd.status = "failure"
            cmd.message = error.message
            return null
        }
    }
}
