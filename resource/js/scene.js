import Storage from "./storage";
import VDECore from "./core";

let Scene = {
    async init() {
        /*Storage.windowList.push(
            VDECore.createWindow("/app/sas.html", 100, 100, 400, 300, [
                {
                    position: 'left',
                    style: {
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        maxWidth: '120px'
                    },
                    applications: [
                        {
                            style: {
                                flex: 1
                            },
                            url: "/app/sos.html",
                            connectToMain: [0, 0]
                        },
                    ]
                },
            ])
        );*/

        /*Storage.windowList.push(
            VDECore.createWindow("/app/maldan_test-app/index.html", 200, 200, 200, 300)
        );*/

        // Message handler
        window.addEventListener("message", async (event) => {
            let query = event.data;
            let queryData = query.data;
            let applicationWindow = VDECore.findWindow(Storage.windowList, query.sessionId);
            let returnData = null;

            // Window not found
            if (!applicationWindow) return;

            // Run method
            switch (event.data.method) {
                case 'getInfo':
                    returnData = {
                        ...applicationWindow
                    };
                    break;
                case 'getConfig':
                    returnData = 'fuck config cool';
                    break;
                case 'setTitle':
                    console.log('title');
                    applicationWindow.title = query.data;
                    break;
                case 'getAppName':
                    returnData = applicationWindow.appName;
                    break;
                case 'getInstalledApps':
                    returnData = await VDECore.getApplicationList();
                    returnData = returnData.data;
                    break;
                case 'removeAppByRepo':
                    await VDECore.removeAppByRepo(queryData);
                    await VDECore.loadApplicationList();
                    break;
                case 'installApp':
                    await VDECore.installApp(queryData);
                    break;
                case 'setPorts':
                    applicationWindow.input = query.data.in;
                    applicationWindow.output = query.data.out;
                    break;
                case 'channelData':
                    for (let i = 0; i < Storage.connectionList.length; i++) {
                        // Found transmitter by sessionId
                        if (Storage.connectionList[i].transmitter.sessionId === query.sessionId) {
                            // Send to receiver
                            Storage.sessionWindow[Storage.connectionList[i].receiver.sessionId].postMessage({
                                isChannelData: true,
                                channelId: Storage.connectionList[i].inCh,
                                data: query.data
                            }, '*');
                        }
                    }
                    return;
            }

            // Send response back
            event.source.postMessage({
                messageId: query.messageId,
                status: true,
                errorMessage: '',
                data: returnData
            }, '*');
        });

        await VDECore.loadApplicationList();
    }
};

export default Scene;