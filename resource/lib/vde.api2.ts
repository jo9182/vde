/// <reference path="vde/VdeSystemApi.ts" />
/// <reference path="vde/VdeFileSystem.ts" />
/// <reference path="vde/VdeApplication.ts" />

declare class Vue {
    constructor(p);
}

class VDE2 {
    // Base api
    static api: VdeSystemApi = new VdeSystemApi();
    static fs: VdeFileSystem = new VdeFileSystem();
    static app: VdeApplication = new VdeApplication();

    static async init({components = [], window, start, method = null, data = {}}) {
        // Init api
        this.api.init();

        // Hide app
        this.app.hide();

        // Wait until document is ready
        await this.app.isReady();

        // App is ready
        let appIsReady = () => {
        };

        // Settings
        let settings: any = await VDE2.api.query('getSettings');

        // App skeleton
        const vueApp = new Vue({
            el: '#app',
            mounted() {
                let args = {};
                try {
                    args = JSON.parse(settings.args);
                } catch {
                }
                if (start) appIsReady = start.bind(this);
            },
            methods: method,
            data: () => data
        });

        // Set window size
        await this.api.setWindowSize(window.width || 320, window.height || 240);

        // App is ready for usage
        appIsReady();

        // Tell system app is ready
        await this.api.query('setApplicationIsReady');

        // Show app
        this.app.show();
    }
}