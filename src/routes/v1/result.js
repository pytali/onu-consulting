import tb_telnet_response from '../../database/index.js';

export default async function resultRoutes(fastify, options) {
    fastify.get('/result/:jobId', async (request, reply) => {
        const { jobId } = request.params

        const audit = await tb_telnet_response.findOne({ jobId });

        if (audit) {
            reply.status(200).send(audit.response);
        } else {
            reply.status(404).send({ error: 'Result not found' });
        }
    });
}