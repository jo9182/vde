import DataStorage from "./data.storage";
import AppApi from "./app.api";
import SystemApi from "./system.api";

let SceneApi = {
    // Load application list
    async reloadApplicationList() {
        let appList = await AppApi.list();
        DataStorage.applicationList.length = 0;
        if (appList) {
            for (let i = 0; i < appList.length; i++) {
                if (!appList[i].position) appList[i].position = {x: 0, y: 0};
                appList[i].position.x = 16;
                appList[i].position.y = 16 + i * 96;
                DataStorage.applicationList.push(appList[i]);
            }
        }
    },

    async runApplication(name) {
        let app = await AppApi.findBy(name);
        let sessionKey = await AppApi.getSessionKey(app.name);
        let appSettings = app.settings || {};

        let settingsPattern = [
            { key: 'args', type: 'text', value: appSettings.args || '' },
            { key: 'name', type: 'label', value: name },
            { key: 'modules', type: 'text', value: appSettings.modules || '' },
            { key: 'update', type: 'button', value: 'Update', async click(win) {
                await AppApi.pullUpdate(app.repo);
                windowData.showSettings = false;
                win.reload();
            } },
        ];

        // Run new app
        let windowData = {
            appInfo: app,
            sessionKey: sessionKey,
            url: '//' + sessionKey + '.'
                + window.location.hostname + ':'
                + (window.location.port * 1 + 1) + '/index.html',
            x: Math.random() * (window.innerWidth - 480),
            y: Math.random() * (window.innerHeight - 240),
            width: 480,
            height: 240,
            showOptions: false,
            showSettings: false,
            tabs: [],
            options: {},
            settings: settingsPattern,
            isReady: null
        };
        DataStorage.windowList.push(windowData);
    },

    async closeApplication(sessionKey) {
        await AppApi.destroySessionKey(sessionKey);
        for (let i = 0; i < DataStorage.windowList.length; i++) {
            if (DataStorage.windowList[i].sessionKey === sessionKey) {
                DataStorage.windowList.splice(i, 1);
                return;
            }
        }
    },

    findWindowBy(query, by = 'sessionKey') {
        let list = DataStorage.windowList;
        for (let i = 0; i < list.length; i++)
            if (list[i][by] === query) return list[i];
        return null;
    },

    connectWindows(winOut, winInput, channelOut, channelIn, isVisible = true) {
        let _winOut = this.findWindowBy(winOut);
        let _winInput = this.findWindowBy(winInput);
        if (!_winOut || !_winInput) return;

        DataStorage.connectionList.push({
            isVisible,
            winOut: _winOut,
            winInput: _winInput,
            channelOut,
            channelIn
        });
    },

    ccc() {
        this.connectWindows(
            DataStorage.windowList[0].sessionKey,
            DataStorage.windowList[1].sessionKey,
            'command',
            'command'
        );
    },

    initVDEApi() {
        window.addEventListener("message", async (event) => {
            let query = event.data;
            let queryData = query.data;
            let applicationWindow = this.findWindowBy(query.sessionKey);
            let returnData = null;

            // Window not found
            if (!applicationWindow) return;

            // Run method
            SystemApi.currentWindow = applicationWindow;

            // Channel data
            if (event.data.method === "channelData") {
                for (let i = 0; i < DataStorage.connectionList.length; i++) {
                    // Found window out by sessionKey
                    if (DataStorage.connectionList[i].winOut.sessionKey === query.sessionKey) {
                        // Send to window input
                        if (DataStorage.sessionWindow[DataStorage.connectionList[i].winInput.sessionKey]) {
                            DataStorage.sessionWindow[DataStorage.connectionList[i].winInput.sessionKey].postMessage({
                                isChannelData: true,
                                channelId: DataStorage.connectionList[i].channelIn,
                                data: query.data
                            }, '*');
                        }
                    }
                }
                return;
            }

            // Run method
            if (SystemApi[event.data.method])
                returnData = await SystemApi[event.data.method](queryData);

            // Send response back
            event.source.postMessage({
                messageId: query.messageId,
                status: true,
                errorMessage: '',
                data: returnData
            }, '*');
        });
    }
};

export default SceneApi;