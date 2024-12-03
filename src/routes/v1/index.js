import executeRoutes from './execute.js';
import resultRoutes from './result.js';
import uncfgRoutes from "./unconfig.js";



export default async function ApiV1Routes(fastify, options) {
    fastify.register(executeRoutes);
    fastify.register(resultRoutes);
    fastify.register(uncfgRoutes);
}