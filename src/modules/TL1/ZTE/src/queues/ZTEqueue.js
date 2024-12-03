import Queue from 'bull';
import { Worker } from 'worker_threads';
import config from '../config/index.js';
import {tb_audit} from '../../../../../database/index.js';
const ZteQueue = new Queue('zte_telnet', {
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


const workers = [];
const workerJobMap = new Map();
let currentWorkerIndex = 0;

for (let i = 0; i < config.worker.concurrency; i++) {
    const worker = new Worker(new URL('../workers/TelnetZTEWorker.js', import.meta.url), {
        workerData: { workerIndex: i, login: config.telnet },
    });
    worker.setMaxListeners(100);
    worker.on('message', async (result) => {
        const job = workerJobMap.get(worker);
        // console.log(result)
        if (job) {
            if (result.error) {
                job.done(new Error(result.error));
            } else {
                if(job.data.user !== 'headless') {
                    await tb_audit.create({
                        user: job.data.user,
                        requestIp: job.data.requestIp,
                        port: job.data.port,
                        jobId: job.data.jobId,
                        command: job.data.command
                    });
                }
                job.done(null, result.parsedResponse);
            }
            workerJobMap.delete(worker);
        }
    });
    workers.push(worker);
}



ZteQueue.process(config.worker.concurrency, async (job, done) => {
    const workerIndex = currentWorkerIndex;
    currentWorkerIndex = (currentWorkerIndex + 1) % workers.length;
    const worker = workers[workerIndex];

    workerJobMap.set(worker, { data: job.data, done });
    worker.postMessage(job.data);
});

// Periodicamente remove jobs na fila por mais de 2 minutos
// setInterval(async () => {
//     const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
//     await fiberhomequeue.clean(twoMinutesAgo, 'wait');
//     await fiberhomequeue.clean(twoMinutesAgo, 'delayed');
// }, 60 * 1000); // Run every minute





export default ZteQueue;