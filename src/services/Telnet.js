import net from "net";
import {logger} from "onu-consulting/utils";


export default class Telnet {
    constructor(workerData, config) {
        this.workerData = workerData;
        this.config = config;
        this.clients = [];
        this.initializeConnections();
        this.sendShakehand()
    }


    sendShakehand() {

        setInterval(async () => {
            try {
                await this.sendCommand(`SHAKEHAND:::CTAG::;`);
                logger.info('SHAKEHAND command sent to workers');
            } catch (error) {
                logger.error('Error sending SHAKEHAND command:', error);
            }
        }, 9 * 60 * 1000);

    }


    async initializeConnections() {
        const client = new net.Socket();
        const {workerIndex, login} = this.workerData;

        const connectToServer = async () => {
            client.connect(this.config.telnet.port, this.config.telnet.host, async () => {
                logger.info(`Worker ${workerIndex} Connected to Telnet server ${this.config.telnet.host}:${this.config.telnet.port}`);
                try {
                    await this.sendCommand(`LOGIN:::CTAG::UN=${login.user},PWD=${login.pass};\r`);
                    logger.info('Login command sent');
                } catch (error) {
                    logger.error('Error sending login command:', error);
                }
            });
        };


        await connectToServer()

        client.on('data', this.handleData.bind(this));
        client.on('error', (err) => {
            logger.error(`Telnet client error:`, err);
        });
        client.on('close', async () => {
            logger.info(`Telnet client closed. Attempting to reconnect...`);
            while (true) {
                try {
                    await connectToServer();
                    break;
                } catch (error) {
                    logger.error('Reconnection attempt failed. Retrying in 5 seconds...');
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }
        });
        this.clients.push(client);
    }

    handleData(data) {
        const client = this.clients[0];
        const responseData = data.toString();
        client.partialResponse = (client.partialResponse || '') + responseData;

        if (this.isCompleteResponse(client.partialResponse)) {

            client.commandResolve(client.partialResponse);
            client.partialResponse = '';
        }
    }

    isCompleteResponse(response) {
        // Implement logic to determine if the response is complete
        return response.endsWith(';');
    }


    async sendCommand(command) {
        return new Promise((resolve, reject) => {
            const client = this.clients[0];
            client.commandResolve = resolve;
            client.commandReject = reject;
            client.partialResponse = '';
            client.write(command);
        });
    }
}