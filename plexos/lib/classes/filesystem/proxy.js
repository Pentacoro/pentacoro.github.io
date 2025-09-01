import File from "./file.js"
import {plexos} from "../../../ini/system.js"
export default class ProxyFile extends File {
    static createDynamicProxy(target = {}, file) {
        // Store the REAL target (not an empty object)
        const realTarget = Object.assign({}, target) // Clone the input
        
        // Attach return method (non-enumerable)
        Object.defineProperty(realTarget, 'return', {
            value: () => ProxyFile.unwrapProxy(realTarget),
            writable: false,
            configurable: true,
            enumerable: false
        })
    
        return new Proxy(realTarget, {
            get(target, prop, receiver) {
                if (prop === 'return') return target.return
                if (!(prop in target)) {
                    target[prop] = ProxyFile.createDynamicProxy({}, file)
                }
                return Reflect.get(target, prop, receiver)
            },
            set(target, prop, value, receiver) {
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    value = ProxyFile.convertToProxyModel(value, file)
                }
                //plexos.Core.logChange("update",file.cfg.path)
                return Reflect.set(target, prop, value, receiver)
            }
        })
    }
    static convertToProxyModel(obj, file) {
        // If the input is not an object, return it as-is
        if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
            return obj
        }
      
        // Create a proxy for the current object
        const proxy = ProxyFile.createDynamicProxy(obj, file)
      
        // Recursively convert all nested objects into proxies
        for (const key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                proxy[key] = ProxyFile.convertToProxyModel(obj[key], file)
            }
        }

        return proxy
    }
    static unwrapProxy(proxy) {
        // Base case: return non-objects as-is
        if (!proxy || typeof proxy !== 'object') return proxy
    
        // Get the target (or use proxy if not actually a proxy)
        let target = proxy
    
        // Handle arrays
        if (Array.isArray(target)) {
            return target.map(item => ProxyFile.unwrapProxy(item))
        }
    
        // Handle regular objects
        const result = {}
        for (const key in target) {
            if (target.hasOwnProperty(key) && key !== 'return') { // Skip 'return'
                result[key] = ProxyFile.unwrapProxy(target[key])
            }
        }
        return result
    }
    static isEmpty(target) {
        return Object.keys(ProxyFile.unwrapProxy(target)).length === 0
    }
    constructor(p) {
        super()
        this.name = p.name
        this.cfg = p.cfg
        if (p.data) {
            this.data = ProxyFile.convertToProxyModel(p.data,this)
        } else {
            this.data = ProxyFile.createDynamicProxy({},this)
        }
    }
}