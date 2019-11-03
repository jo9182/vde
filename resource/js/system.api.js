import AppApi from "./app.api";
import SceneApi from "./scene.api";

let SystemApi = {
    currentWindow: null,
    getAppInfo() {
        return this.currentWindow.appInfo;
    },
    setTitle(title) {
        this.currentWindow.appInfo.title = title;
    },
    async getInstalledApplicationList() {
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