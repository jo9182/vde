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
        window.addEventListener("message", (event) => {
            let queryData = event.data;
            let applicationWindow = VDECore.findWindow(Storage.windowList, queryData.sessionId);
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
                    applicationWindow.title = queryData.data;
                    break;
                case 'setPorts':
                    applicationWindow.input = queryData.data.in;
                    applicationWindow.output = queryData.data.out;
                    break;
                case 'channelData':
                    for (let i = 0; i < Storage.connectionList.length; i++) {
                        // Found transmitter by sessionId
                        if (Storage.connectionList[i].transmitter.sessionId === queryData.sessionId) {
                            // Send to receiver
                            Storage.sessionWindow[Storage.connectionList[i].receiver.sessionId].postMessage({
                                isChannelData: true,
                                channelId: Storage.connectionList[i].inCh,
                                data: queryData.data
                            }, '*');
                        }
                    }
                    return;
            }

            // Send response back
            event.source.postMessage({
                messageId: queryData.messageId,
                status: true,
                errorMessage: '',
                data: returnData
            }, '*');
        });

        let list = await VDECore.getApplicationList();
        for (let i = 0; i < list.data.length; i++) {
            list.data[i].x = 100;
            list.data[i].y = 100;
            list.data[i].width = 48;
            list.data[i].height = 48;
        }
        Storage.applicationList = list.data;
    }
};

export default Scene;