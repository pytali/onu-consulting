import { fork } from 'child_process';
import { logger } from 'onu-consulting/utils';
import { nanoid } from "nanoid";
import ZTEqueue from "../modules/TL1/ZTE/src/queues/ZTEqueue.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { tb_devices } from "../database/index.js";
import fiberhomequeue from "../modules/TL1/Fiberhome/src/queues/Fiberhomequeue.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const childPath = path.resolve(__dirname, './child/UnregChild.js');

const child = fork(childPath);

const jobId = nanoid();

export let UnregInfo = []


child.on('message', async (result) => {
    if (result.error) {
        logger.error('Error processing unregistered ONUs:', result.error);
    } else {
        const { unregOnus } = result;
        // Process unregistered ONUs as needed
        UnregInfo = unregOnus ;
    }
});

child.on('error', (error) => {
    logger.error('Error in UnregChild process:', error);
});

child.on('exit', (code) => {
    logger.info('UnregChild exited with code:', code);
});



export default async function refreshUnregOnus() {

    logger.info('Refreshing unregistered ONUs');


    const devices = await tb_devices.find({});


    const zteDevices = devices.filter(device => device.VENDOR === 'ZTE');

    const fiberhomeDevices = devices.filter(device => device.VENDOR === 'Fiberhome');

    let ZTEIDs = [];
    let FHIDs = [];


    for (const device of zteDevices) {
        const command = `LST-UNREGONU::OLTID=${device.IP}:NMS_API-${device.IP}::;`;
        const queue = await ZTEqueue.add({ jobId: nanoid(), command, user: 'headless' });
        ZTEIDs.push(Number(queue.id));

    }

    if (fiberhomeDevices.length > 0) {
        const command = 'LST-UNREGONU:::NMS_API::;';
        const queue = await fiberhomequeue.add({ jobId: nanoid(), command, user: 'headless' });

        FHIDs.push(Number(queue.id));
    }

    child.send({ ZTEIDs, FHIDs });
}

setInterval(refreshUnregOnus, 60 * 1000 ); // 4 hours

process.on('exit', (code) => {

    logger.error('UnregInfo process exited with code:', code);

    child.kill();
});
