import dotenv from 'dotenv';
dotenv.config();

export default {
    telnet: {
        host: '172.30.0.201',
        port: 9830,
        user: process.env.ZTE_USERNAME,
        pass: process.env.ZTE_PASSWORD
    },
    worker: {
        concurrency: parseInt(process.env.WORKER_CONCURRENCY_ZTE)
    },
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    },
    // rabbitmq: {
    //     host: process.env.RABBITMQ_HOST || 'localhost',
    //     port: process.env.RABBITMQ_PORT || 5672,
    //     queue: ["fiberhomequeue"]
    // },
    // database: {
    //     uri: process.env.MONGO_URI
    // }
};