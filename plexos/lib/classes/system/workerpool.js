export default class WorkerPool {
    constructor(size, workerScript) {
        this.pool = Array.from({ length: size }, () => new Worker(workerScript))
        this.queue = []
        this.busy = new Set()
    }

    execute(taskData) {
        return new Promise((resolve) => {
            const worker = this.pool.find(w => !this.busy.has(w))
            if (worker) {
                this.busy.add(worker)
                worker.onmessage = (e) => {
                    this.busy.delete(worker)
                    resolve(e.data)
                    this.processQueue()
                };
                worker.postMessage(taskData)
            } else {
                this.queue.push({ taskData, resolve })
            }
        });
    }

    processQueue() {
        if (this.queue.length) {
            const { taskData, resolve } = this.queue.shift()
            this.execute(taskData).then(resolve)
        }
    }
}