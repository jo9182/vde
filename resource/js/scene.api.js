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
            x: 100,
            y: 100,
            width: app.minWidth || 480,
            height: app.minHeight || 240,
            showOptions: false,
            showSettings: false,
            tabs: [],
            options: {},
            settings: settingsPattern
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