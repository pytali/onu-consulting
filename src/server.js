import app from './app.js';
import refreshDevices from './headless/Devinfo.js';
import refreshUnregOnus from './headless/UnregInfo.js';


setTimeout(() => {
    refreshDevices();
}, 3000)

setTimeout(() => {
    refreshUnregOnus();
}, 4000)



const options = {
    port: 3000,
    host: '127.0.0.1',
    backlog: 511,
    exclusive: false,
    readableAll: false,
    writableAll: false,
    ipv6Only: false,
    http2: true,
};

app.listen(options, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server is running on ${address}`);
});