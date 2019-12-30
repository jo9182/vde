const WebSocket = require('ws');
const RecursiveReaddir = require("recursive-readdir");
const Path = require('path');

let serviceList = {};
let serviceInit = async() => {
    let files = await RecursiveReaddir('./service');
    for (let i = 0; i < files.length; i++) {
        let module = require('../' + files[i]);
        let moduleName = Path.basename(files[i]).split('.').slice(0, -1).join('.');

        // Emit for service
        module.emit = (data) => {
            serviceList[moduleName].listeners.forEach((client) => {
                client.send(JSON.stringify({
                    service: moduleName,
                    type: "data",
                    data
                }));
            });
        };

        // Init service
        module.init();

        serviceList[moduleName] = {
            listeners: new Set(),
            module
        };
        console.log(`Start service "${moduleName}"`);
    }
};

module.exports = {
    async run(port) {
        await serviceInit();

        // Start web socket server
        const wss = new WebSocket.Server({
            port: port * 1,
            perMessageDeflate: false
        });
        console.log(`Service manager starts at port ${port}`);

        // Connection
        wss.on('connection', function(ws, req) {
            ws.on('message', function(message) {
                let packageData = null;
                try { packageData = JSON.parse(message); }
                catch {}
                if (!packageData) return;

                // Check is service is exists
                if (!serviceList[packageData.service]) {
                    ws.send(JSON.stringify({
                        status: false,
                        service: packageData.service,
                        message: 'Service not found'
                    }));
                    return;
                }
                
                // Listen service
                if (packageData.type === "listen")
                    serviceList[packageData.service].listeners.add(ws);

                // Write service
                if (packageData.type === "write")
                    serviceList[packageData.service].module.write(packageData.data);
            });
            ws.on('error', console.error);
            ws.on('close', function () {
                for (let service in serviceList)
                    if (serviceList.hasOwnProperty(service))
                        serviceList[service].listeners.delete(ws);
            });
        });
    }
};