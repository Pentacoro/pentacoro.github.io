export default class EventBus {
    constructor() {
        this.events = {} // Holds all event listeners
    }

    // Subscribe to an event
    on(eventName, callback, priority = 0, id="") {
        if (!this.events[eventName]) {
            this.events[eventName] = []
        }
        this.events[eventName].push({ callback, priority, id})
        this.events[eventName].sort((a, b) => b.priority - a.priority) // Sort by priority
    }

    // Unsubscribe from an event
    off(eventName, callback, id) {
        if (!this.events[eventName]) return
        if (id) {
            this.events[eventName] = this.events[eventName].filter(listener => listener.id !== id)
        } else {
            this.events[eventName] = this.events[eventName].filter(listener => listener.callback !== callback)
        }
    }

    // Emit an event
    emit(eventName, ...args) {
        if (!this.events[eventName]) return
        this.events[eventName].forEach(({callback,priority}) => callback(...args))
    }

    once(eventName, callback) {
        const wrapper = (...args) => {
            callback(...args)
            this.off(eventName, wrapper) // Remove listener after first execution
        }
        this.on(eventName, wrapper)
    }

    getListeners(eventName) {
        return this.events[eventName] || []
    }
}