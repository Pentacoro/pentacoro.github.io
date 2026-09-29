import plexos from "../../../ini/system.js"
import {genRanHex, runLauncher} from "/plexos/lib/functions/dll.js"
import File from "../filesystem/file.js"
import Task from "./task.js"
import ProxyFile from "../filesystem/proxy.js"
import Component from "../interface/component.js"
import ChangeLog from "./changeLog.js"
import EventBus from "./eventbus.js"
let System = plexos.System

export default class Command {
    constructor(cmd) {
        Object.assign(this, {
            author: cmd.author,
            command: cmd.command,
            arguments: cmd.arguments,
            timestamp: Date.now(),
            status: "queried",
            message: ""
        })
    }

    static hasPermission(required, permissions) {
        const generic = required.split('.')[0]  // e.g. "file", "task", "event"
        return permissions.includes(required) || permissions.includes(generic)
    }

    static async run(cmd) {
        const commandMap = {
            'file.create': { 
                fn: (args) => {
                    return File.create(args.path, args.Type, args.name, args.newFileIcon)
                },
                msg: (args) => `File created at ${args.path || 'unknown'}` 
            },
            'file.read': { 
                fn: (args) => {
                    return File.read(args.path)
                },
                msg: () => 'File read successfully'
            },
            'file.write': { 
                fn: (args) => {
                    return File.write(args.path, args.content)
                },
                msg: () => 'File written successfully'
            },
            'file.modify': { 
                fn: (args) => {
                    return File.modify(args.path, args.content)
                },
                msg: () => 'File modified successfully'
            },
            'file.delete': { 
                fn: (args) => {
                    return File.delete(args.path)
                },
                msg: () => 'File deleted successfully'
            },
            'file.move': { 
                fn: (args) => {
                    return File.move(args.path, args.newPath)
                },
                msg: () => 'File moved successfully'
            },
            'file.rename': { 
                fn: (args) => {
                    return File.rename(args.path, args.newName)
                },
                msg: () => 'File renamed successfully'
            },
            'task.launch': { fn: Task.launch, msg: () => 'Task launched successfully' },
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
                msg: () => ''
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
                msg: () => ''
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
                msg: () => ''
            },
            'event.emit': {
                fn: (args) => {
                    Task.System().bus.emit(args.eventName, ...(args.args || []))
                },
                msg: () => ''
            }
        }

        cmd.status = "running"

        try {
            const command = commandMap[cmd.command]
            if (!command) throw new Error(`Unknown command: ${cmd.command}`)

            // --- Permission check for all commands ---
            const appProxy = File.at('/plexos/reg/applications.proxy')
            if (!appProxy) throw new Error('Application proxy not found')

            const appName = cmd.author
            const registryPath = Task.get(appName)?.registryPath
            let permissions = []
            let prohibitions = []
            if (appProxy.data.SYSTEM && appProxy.data[registryPath]) {
                permissions = ProxyFile.unwrapProxy(appProxy.data[registryPath].systemPermissions) || []
                prohibitions = ProxyFile.unwrapProxy(appProxy.data[registryPath].systemProhibitions) || []
            }

            const requiredPermission = cmd.command.startsWith('event.') ? 'event' : cmd.command

            // Check if prohibited
            if (prohibitions.length > 0 &&Command.hasPermission(requiredPermission, prohibitions)) {
                cmd.status = "failure"
                cmd.message = `Forbidden from ${requiredPermission}`
                return null
            }

            // Check if allowed
            if (permissions.length > 0 &&!Command.hasPermission(requiredPermission, permissions)) {
                // Permission not granted, ask user
                const granted = await Task.System().askPermission(cmd.author, requiredPermission)
                if (!granted) {
                    cmd.status = "failure"
                    cmd.message = `Permission denied for ${requiredPermission}`
                    return null
                }
            }

            // Execute command
            const result = await command.fn({ ...cmd.arguments, author: cmd.author, taskId: cmd.taskId })
            cmd.status = "success"
            cmd.message = command.msg(cmd.arguments)
            return result
        } catch (error) {
            cmd.status = "failure"
            cmd.message = error.message
            return null
        }
    }
}