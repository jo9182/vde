import DataStorage from "./data.storage";
import AppApi from "./app.api";

let SceneApi = {
    // Load application list
    async reloadApplicationList() {
        let appList = await AppApi.list();
        DataStorage.applicationList.length = 0;
        if (appList) {
            for (let i = 0; i < appList.length; i++) {
                DataStorage.applicationList[i] = appList[i];
                if (!DataStorage.applicationList[i].position)
                    DataStorage.applicationList[i].position = {x: 0, y: 0};

                DataStorage.applicationList[i].position.x = 16;
                DataStorage.applicationList[i].position.y = 16 + i * 96;
            }
        }
    },

    async runApplication(name) {
        let app = await AppApi.findBy(name);
        let sessionKey = await AppApi.getSessionKey(app.name);

        // Run new app
        DataStorage.windowList.push({
            appInfo: app,
            sessionKey: sessionKey,
            url: '//' + sessionKey + '.'
                + window.location.hostname + ':'
                + (window.location.port * 1 + 1) + '/index.html',
            x: 100,
            y: 100,
            width: 480,
            height: 240
        });
    },

    async closeApplication(sessionKey) {
        await AppApi.destroySessionKey(sessionKey);
        for (let i = 0; i < DataStorage.windowList.length; i++) {
            if (DataStorage.windowList[i].sessionKey === sessionKey) {
                DataStorage.windowList.splice(i, 1);
                return;
            }
        }
    }
};

export default SceneApi;