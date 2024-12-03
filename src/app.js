import Fastify from 'fastify';
import { FastifyAdapter } from '@bull-board/fastify';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter.js';
import telnetqueue from './modules/TL1/Fiberhome/src/queues/Fiberhomequeue.js';
import ZteQueue from './modules/TL1/ZTE/src/queues/ZTEqueue.js';
import ApiV1Routes from "./routes/v1/index.js";

const serverAdapter = new FastifyAdapter();
const app = Fastify();

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
    queues: [new BullAdapter(telnetqueue), new BullAdapter(ZteQueue)],
    serverAdapter,
});

serverAdapter.setBasePath('/admin/queues');
app.register(serverAdapter.registerPlugin(), { prefix: '/admin/queues' });

app.register(ApiV1Routes, { prefix: '/api/v1' });

export default app;