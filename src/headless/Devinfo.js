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
const childPath = path.resolve(__dirname, './child/DeviceChild.js');

const child = fork(childPath);

const jobId = nanoid();

child.on('message', async (result) => {
    if (result.error) {
        logger.error('Error refreshing device list:', result);
    } else {
        const { devices } = result;
        // console.log(result)
        // console.log(devices)

        await tb_devices.deleteMany({});
        logger.info('Device list deleted from tb_devices');


        await tb_devices.insertMany(devices);
        logger.info('Device list refreshed and inserted into tb_devices');
    }
});

child.on('error', (error) => {
    logger.error('Error in DeviceChild process:', error);
});

child.on('exit', (code) => {
    logger.info('DeviceChild exited with code:', code);
});

export default async function refreshDevices() {

    const queueZTE = await ZTEqueue.add({ jobId: jobId, command: 'LST-DEVICE:::CTAG::;', user: 'headless' });
    const queueFH = await fiberhomequeue.add({ jobId: jobId, command: 'LST-DEVICE:::CTAG::;', user: 'headless' });

    const IDZTE = Number(queueZTE.id);
    const IDFH = Number(queueFH.id);



    child.send({ IDZTE, IDFH });
}

setInterval(refreshDevices, 4 * 60 * 60 * 1000); // 4 hours

process.on('exit', (code) => {

    logger.error('DeviceChild exited with code:', code);

    child.kill();
});