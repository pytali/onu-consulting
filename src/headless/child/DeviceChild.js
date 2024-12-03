import Queue from 'bull';
import { logger } from 'onu-consulting/utils';
import config from '../../modules/TL1/ZTE/src/config/index.js';
import {Parse} from 'onu-consulting/utils'

const workerZTE = new Queue('zte_telnet', {
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
const workerFH = new Queue('fh_telnet', {
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
// worker.process(async (job) => {
//     try {
//         const result = await getDeviceList(job.id);
//         if (result.returnvalue) {
//             process.send({ jobId: job.id, devices: result.returnvalue });
//         } else {
//             throw new Error('No return value');
//         }
//     } catch (error) {
//         process.send({ error: error.message });
//     }
// });


workerZTE.on('failed', (job, err) => {
    logger.error(`Job ${job.id} failed with error ${err.message}`);
});
workerFH.on('failed', (job, err) => {
    logger.error(`Job ${job.id} failed with error ${err.message}`);
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getDeviceList(jobIdZTE, jobIdFH) {
    while (true) {

        const resultZTE = await workerZTE.getJob(jobIdZTE);
        const resultFH = await workerFH.getJob(jobIdFH);

        if (resultZTE.returnvalue && resultFH.returnvalue) {
            if(resultZTE.returnvalue.EN !== '0') {
                process.send({ error: true, error_message: `code ${resultZTE.returnvalue.EN} error: ${resultZTE.returnvalue.ENDESC}` });
                break;
        }
            if( resultFH.returnvalue.EN !== '0' && resultFH.returnvalue.EN !== undefined) {
                process.send({ error: true, error_message: `code ${resultFH.returnvalue.EN} error: ${resultFH.returnvalue.ENDESC}` });
                break;
            }
            let result = [...Parse.transformDeviceResponse(resultFH.returnvalue.attributes, resultFH.returnvalue.result, 'Fiberhome'),
                                ...Parse.transformDeviceResponse(resultZTE.returnvalue.attributes, resultZTE.returnvalue.result, 'ZTE')]
            // console.log(result)
            process.send({ devices: result })
            break;
        }
        await sleep(1000);
    }
}

process.on('message', (job) => {
    getDeviceList(job.IDZTE, job.IDFH);
});