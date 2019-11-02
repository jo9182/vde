import axios from "axios";
import DataStorage from "./data.storage";
import AppApi from "./app.api";

let SceneApi = {
    // Load application list
    async reloadApplicationList() {
        let appList = await AppApi.list();
        DataStorage.applicationList.length = 0;
        if (appList)
            for (let i = 0; i < appList.length; i++)
                DataStorage.applicationList[i] = appList[i];
    },

    async runApplication(name) {
        let app = await AppApi.findBy(name);

        // Run new app
        DataStorage.windowList.push({
            appInfo: app,
            sessionId: Math.random() + '',
            url: '//' + localStorage.getItem('access_token') + '_' + app.applicationKey + '.'
                + window.location.hostname + ':' + (window.location.port * 1 + 1) + '/index.html',
            x: 100,
            y: 100,
            width: 480,
            height: 240
        });
    }
};

export default SceneApi;