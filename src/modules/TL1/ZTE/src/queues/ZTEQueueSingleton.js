import Queue from 'bull';
import { Worker } from 'worker_threads';
import config from '../config/index.js';
import { tb_audit } from '../../../../../database/index.js';

class ZTEQueueSingleton {
    constructor() {
        if (!ZTEQueueSingleton.instance) {
            this.queue = new Queue('zte_telnet', {
                redis: {
                    host: config.redis.host,
                    port: config.redis.port,
                },
                limiter: {
                    max: 40,
                    duration: 2000,
                },
                defaultJobOptions: {
                    timeout: 10000,
                    attempts: 3
                }
            });

            this.workers = [];
            this.workerJobMap = new Map();
            this.currentWorkerIndex = 0;

            for (let i = 0; i < config.worker.concurrency; i++) {
                const worker = new Worker(new URL('../workers/TelnetZTEWorker.js', import.meta.url), {
                    workerData: { workerIndex: i, login: config.telnet },
                });
                worker.setMaxListeners(100);
                worker.on('message', async (result) => {
                    const job = this.workerJobMap.get(worker);
                    if (job) {
                        if (result.error) {
                            job.done(new Error(result.error));
                        } else {
                            await tb_audit.create({
                                user: job.data.user,
                                requestIp: job.data.requestIp,
                                port: job.data.port,
                                jobId: job.data.jobId,
                                command: job.data.command
                            });
                            job.done(null, result.parsedResponse);
                        }
                        this.workerJobMap.delete(worker);
                    }
                });
                this.workers.push(worker);
            }

            this.queue.process(config.worker.concurrency, async (job, done) => {
                const workerIndex = this.currentWorkerIndex;
                this.currentWorkerIndex = (this.currentWorkerIndex + 1) % this.workers.length;
                const worker = this.workers[workerIndex];

                this.workerJobMap.set(worker, { data: job.data, done });
                worker.postMessage(job.data);
            });

            ZTEQueueSingleton.instance = this;
        }

        return ZTEQueueSingleton.instance;
    }
}

const instance = new ZTEQueueSingleton();

export default instance.queue;