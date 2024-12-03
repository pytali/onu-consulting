import {parentPort, workerData} from 'worker_threads';
import config from '../config/index.js';
import FHTelnet from "../services/FHTelnet.js";

const telnetWorker = new FHTelnet(workerData, config);

parentPort.on('message', async (task) => {
    const {workerIndex, command, user, pass} = task;
    try {
        const response = await telnetWorker.sendCommand(command);
        const parsedResponse = telnetWorker.parse(response);
        parentPort.postMessage({workerIndex, parsedResponse});
    } catch (error) {
        parentPort.postMessage({workerIndex, error: error.message});
    }
});