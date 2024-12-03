import { nanoid } from 'nanoid';
import Unregonu from "../../view/Unregonu.js";

export default async function uncfgRoutes(fastify, options) {
    fastify.get('/listonu', async (request, reply) => {
        // const { user, priority = 3 } = request.body;
        const { ip, socket: { remotePort: port } } = request;

        const jobId = nanoid();

        const onuList = await Unregonu({
            requestIp: ip, port, jobId
        });


        if(!onuList[0]) {
            reply.code(404);
            reply.send({ error: 'Not Found ONU', nexTry: 60 });
        }

        console.table(onuList)

        reply.send(onuList);
    });
    fastify.get('/authorize', async (request, reply) => {
        // const { user, priority = 3 } = request.body;
        // const { ip, socket: { remotePort: port } } = request;

        console.log(request.query)

        const jobId = nanoid();




    })
}
