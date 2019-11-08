import AppApi from "./app.api";
import SceneApi from "./scene.api";
import DataStorage from "./data.storage";

let SystemApi = {
    currentWindow: null,
    getAppInfo() {
        return this.currentWindow.appInfo;
    },
    setTitle(title) {
        this.currentWindow.appInfo.title = title;
    },
    setWindowSize(size) {
        this.currentWindow.width = size[0];
        this.currentWindow.height = size[1] + 36 + 2;
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
    },
    async pullUpdateApplication(repo) {
        await AppApi.pullUpdate(repo);
    },
    setTabs(tabs) {
        // First tabs
        if (!this.currentWindow.tabs.length)
            this.currentWindow.height += 25.33;

        // If have tabs and set empty tabs
        if (this.currentWindow.tabs.length && !tabs.length)
            this.currentWindow.height -= 25.33;

        this.currentWindow.tabs = tabs;
    },
    setOptions(options) {
        // Convert object to list
        let optionList = [];
        for (let option in options) {
            if (options.hasOwnProperty(option)) {
                optionList.push({
                    key: option,
                    ...options[option]
                });
            }
        }

        // Save options
        this.currentWindow.options = optionList;
    },
    getSettings() {
        let object = {};
        for (let i = 0; i < this.currentWindow.settings.length; i++)
            object[this.currentWindow.settings[i].key] = this.currentWindow.settings[i].value;
        return object;
    },
    showOptions() {
        this.currentWindow.showOptions = true;
    },
    hideOptions() {
        this.currentWindow.showOptions = false;
    }
};

export default SystemApi;