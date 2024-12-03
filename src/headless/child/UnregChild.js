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

workerZTE.on('failed', (job, err) => {
    logger.error(`Job ${job.id} failed with error ${err.message}`);
});
workerFH.on('failed', (job, err) => {
    logger.error(`Job ${job.id} failed with error ${err.message}`);
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function removeDuplicateIPsExceptDifferentSN(entries) {
    const seenIPs = {};
    const uniqueEntries = [];

    entries.forEach(entry => {
        if (!seenIPs[entry.IP]) {
            seenIPs[entry.IP] = new Set();
        }

        if (!seenIPs[entry.IP].has(entry.SN)) {
            seenIPs[entry.IP].add(entry.SN);
            uniqueEntries.push(entry);
        }
    });

    return uniqueEntries;
}

async function fetchUnregOnus(ZTEIDs, FHIDs) {

    while (true) {
        try {
            let allJobsCompleted = true;
            let combinedResults = [];




            for (const ZTEID of ZTEIDs) {
                const jobZTE = await workerZTE.getJob(ZTEID);

                if (jobZTE && jobZTE.returnvalue) {
                    if(jobZTE.returnvalue.EN  != '0') {
                        process.send({
                            error: 'Error in getting device list',
                            code: jobZTE.returnvalue.EN,
                            message: jobZTE.returnvalue.ENDESC
                        });
                        break;
                    }
                    const parsedZTE = Parse.transformUnregResponse(jobZTE.returnvalue.attributes, jobZTE.returnvalue.result, 'ZTE', jobZTE.returnvalue.tag.split("-")[1]);
                   parsedZTE != null ? combinedResults = combinedResults.concat(parsedZTE) : null;

                } else {
                    allJobsCompleted = false;
                    break;
                }
            }

            for (const FHID of FHIDs) {
                const jobFH = await workerFH.getJob(FHID);
                if (jobFH && jobFH.returnvalue) {
                    const parsedFH = Parse.transformUnregResponse(jobFH.returnvalue.attributes, jobFH.returnvalue.result, 'Fiberhome');
                    parsedFH != null ? combinedResults = combinedResults.concat(parsedFH) : null;
                } else {
                    allJobsCompleted = false;
                    break;
                }
            }

            if (allJobsCompleted) {


                process.send({ unregOnus: removeDuplicateIPsExceptDifferentSN(combinedResults) });

                break;
            }
        } catch (error) {
            logger.error('Error fetching unregistered ONUs:', error);

            process.send({ error: error.message });
            break;
        }

        await sleep(1000); // Wait for 1 second before checking again
    }
}

process.on('message', (job) => {
    // console.log(job)
    fetchUnregOnus(job.ZTEIDs, job.FHIDs);
});