import AppApi from "./app.api";
import SceneApi from "./scene.api";

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
    },
    async installApplication(repo) {
        await AppApi.install(repo);
        await SceneApi.reloadApplicationList();
    },
    async removeApplication(repo) {
        await AppApi.remove(repo);
        await SceneApi.reloadApplicationList();
    }
};

export default SystemApi;