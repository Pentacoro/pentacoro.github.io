import File from "./file.js"
export default class String extends File {
    data = {}
    constructor(p) {
        super()
        this.name = p.name
        this.cfg = p.cfg
        this.data = p.data || {}
    }
    set(keyChain, value) {
        let subject = null
        try {
            subject = eval(`this.${keyChain}`)
        } catch {
            throw "Invalid key chain: failed to find value"
        }
        let typeRegex = /([A-Z])\w+/

        let subjectType = Object.prototype.toString.call(subject)
        let objectType = Object.prototype.toString.call(value)

        if (subject === undefined) {
            eval(`this.${keyChain} = ${value}`)
        } else if (subjectType === objectType) {
            subject = value
        } else {
            throw `This value expects a ${subjectType.match(typeRegex)}`
        }
    }
    get() {
        return this.data
    }
}