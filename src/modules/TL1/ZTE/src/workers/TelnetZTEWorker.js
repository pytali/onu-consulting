import {parentPort, workerData} from 'worker_threads';
import config from '../config/index.js';
import ZTETelnet from "../sevice/ZteTelnet.js";

const telnetWorker = new ZTETelnet(workerData, config);

parentPort.on('message', async (task) => {
    const {workerIndex, command, user, pass} = task;
    try {
        // First, send the login command
        // await telnetWorker.sendCommand(`LOGIN:::CTAG::UN=${user},PWD=${pass};\r`);
        // Then, send the actual command
        const response = await telnetWorker.sendCommand(command);
        const parsedResponse = telnetWorker.parse(response);
        parentPort.postMessage({workerIndex, parsedResponse});
    } catch (error) {
        parentPort.postMessage({workerIndex, error: error.message});
    }
});