import AppApi from "./app.api";

let SystemApi = {
    currentWindow: null,
    getAppInfo: () => {
        return SystemApi.currentWindow.appInfo;
    },
    setTitle: (title) => {
        SystemApi.currentWindow.appInfo.title = title;
    },
    getInstalledApplicationList: async () => {
        return await AppApi.list();
    }
};

export default SystemApi;