import { nanoid } from 'nanoid';
import refreshUnregOnus from '../../headless/UnregInfo.js';

import ZteQueue from "../../modules/TL1/ZTE/src/queues/ZTEqueue.js";

export default async function executeRoutes(fastify, options) {
    fastify.post('/execute', async (request, reply) => {
        const { user, pass, command, priority = 3 } = request.body;
        const { ip, socket: { remotePort: port } } = request;

        refreshUnregOnus();

        const jobId = nanoid();

        await ZteQueue.add(
            { requestIp: ip, port, jobId, command, user, pass, priority },
            { priority }
        );

        reply.send({ jobId });
    });
}
