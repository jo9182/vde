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
                appList[i].isNeedToUpdate = false;
                DataStorage.applicationList.push(appList[i]);
            }
        }
    },

    /*async checkUpdateForAllApplication(app) {
        app.isNeedToUpdate = await AppApi.checkUpdate(app.repo);
    },

    async checkUpdateForAllApplications() {
        for (let i = 0; i < DataStorage.applicationList.length; i++) {
            // Check update
            this.checkUpdateForAllApplication(DataStorage.applicationList[i]);
        }
    },*/

    async runApplication(name, asModule = false) {
        let app = await AppApi.findBy(name);
        if (!app) return null;
        let sessionKey = await AppApi.getSessionKey(app.name);
        let appSettings = app.settings || {};

        let settingsPattern = [
            { key: 'name', type: 'label', value: name },
            {  },
            { key: 'args', type: 'text', value: appSettings.args || '' },
            { key: 'modules', type: 'textarea', value: appSettings.modules || '' },
            { key: 'update', type: 'button', value: 'Update', async click(win) {
                await AppApi.pullUpdate(app.repo);
                windowData.showSettings = false;
                win.reload();
            } },
        ];

        // Run new app
        let appUrl = '//' + sessionKey + '.'
            + window.location.hostname + ':'
            + (window.location.port * 1 + 1) + '/';
        // Ip address
        if (window.location.hostname.split('.').length === 4)
            appUrl = `//${window.location.hostname}:${window.location.port}/error.html`;

        let windowY = DataStorage.input.y + Math.random() * 64;
        if (windowY > window.innerHeight / 1.5) windowY = window.innerHeight / 1.5;

        let windowData = {
            appInfo: app,
            sessionKey: sessionKey,
            url: appUrl,
            x: DataStorage.input.x > window.innerWidth / 2 ?DataStorage.input.x - 400 + Math.random() * 64 :DataStorage.input.x + Math.random() * 64,
            y: windowY,
            width: 480,
            height: 240,
            zIndex: 1,
            showOptions: false,
            showSettings: false,
            tabs: [],
            modules: [],
            options: {},
            ports: {
                input: [],
                output: []
            },
            settings: settingsPattern,
            isReady: null,
            isVisible: !asModule,
            ref: null,
            getSetting(key) {
                for (let i = 0; i < this.settings.length; i++)
                    if (this.settings[i].key === key)
                        return this.settings[i].value;
            }
        };
        // Set ports link after initialization
        settingsPattern[1] = {
            key: 'ports',
            type: 'label',
            get value() {
                return 'in: ' + windowData.ports.input.join(", ") + '<br>' +
                    'out: ' + windowData.ports.output.join(", ");
            }
        };

        // Push main app to first module
        windowData.modules.push(windowData);

        // Register window in system
        DataStorage.windowList.push(windowData);

        return windowData;
    },

    async closeApplication(sessionKey) {
        await AppApi.destroySessionKey(sessionKey);
        for (let i = 0; i < DataStorage.windowList.length; i++) {
            if (DataStorage.windowList[i].sessionKey === sessionKey) {
                // Remove found connections
                for (let j = 0; j < DataStorage.connectionList.length; j++) {
                    let x = DataStorage.connectionList[j];

                    if (x.winInput === DataStorage.windowList[i] || x.winOutput === DataStorage.windowList[i]) {
                        this.removeConnection(x.winOutput, x.winInput, x.channelOut, x.channelIn);
                        j -= 1;
                    }
                }

                // Remove window
                DataStorage.windowList.splice(i, 1);
                this.calculateConnectionLines();
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
            winOutput: _winOut,
            winInput: _winInput,
            channelOut,
            channelIn,
            channelUsage: 0
        });

        this.calculateConnectionLines();
    },

    removeConnection(winOut, winInput, channelOut, channelIn) {
        let index = DataStorage.connectionList.findIndex(x => {
            return x.winOutput === winOut && x.winInput === winInput
                && x.channelOut === channelOut && x.channelIn === channelIn;
        });
        if (index !== -1) DataStorage.connectionList.splice(index, 1);
        // this.calculateConnectionLines();
    },

    topWindow(sessionKey) {
        for (let i = 0; i < DataStorage.windowList.length; i++)
            DataStorage.windowList[i].zIndex = 2;
        let win = this.findWindowBy(sessionKey);
        if (win) win.zIndex = 3;
    },

    calculateConnectionLines() {
        DataStorage.sceneLines.length = 0;
        for (let i = 0; i < DataStorage.connectionList.length; i++) {
            let connection = DataStorage.connectionList[i];
            if (!connection.isVisible) continue;

            let fromPort = document.querySelector(
                `#port-${connection.winOutput.sessionKey}-${connection.channelOut}`
            ).getBoundingClientRect();
            let toPort = document.querySelector(
                `#port-${connection.winInput.sessionKey}-${connection.channelIn}`
            ).getBoundingClientRect();

            // Visual line effect
            let sin = Math.sin(new Date().getTime() / 32) * 0.1;
            if (connection.channelUsage < 1)
                sin *= connection.channelUsage;
            let lineMultiplierX = 1.1 + sin;
            let lineWidthMultiplier = 4 + connection.channelUsage / 3;

            // Scene lines
            DataStorage.sceneLines.push([
                `
                    M${fromPort.x + 9} ${fromPort.y + 9}
                    C ${(fromPort.x + 9) * lineMultiplierX} ${(fromPort.y + 9)},
                    ${(toPort.x + 9) / lineMultiplierX} ${(toPort.y + 9)},
                    ${toPort.x + 9} ${toPort.y + 9}
                `.trim(),
                connection.channelUsage > 0.1 ?'#ffffff' :'#9dff00',
                lineWidthMultiplier
            ]);

            // Visual channel usage
            connection.channelUsage += (0 - connection.channelUsage) / 24;
        }
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
                let isFound = false;

                if (!applicationWindow.ports.output.includes(query.channelId)) {
                    console.error(`Output port "${query.channelId}" not registered!`);
                    return;
                }

                for (let i = 0; i < DataStorage.connectionList.length; i++) {
                    // Found window out by sessionKey and channel out
                    if (DataStorage.connectionList[i].winOutput.sessionKey === query.sessionKey
                        && DataStorage.connectionList[i].channelOut === query.channelId) {

                        // Send to window input
                        if (DataStorage.sessionWindow[DataStorage.connectionList[i].winInput.sessionKey]) {
                            // Channel log
                            DataStorage.channelLog.push({
                                fromApp: DataStorage.connectionList[i].winOutput.appInfo.name,
                                toApp: DataStorage.connectionList[i].winInput.appInfo.name,
                                channelOut: DataStorage.connectionList[i].channelOut,
                                channelIn: DataStorage.connectionList[i].channelIn,
                                size: queryData.length
                            });

                            isFound = true;

                            // Send to client
                            DataStorage.sessionWindow[DataStorage.connectionList[i].winInput.sessionKey].postMessage({
                                isChannelData: true,
                                channelId: DataStorage.connectionList[i].channelIn,
                                data: queryData
                            }, '*');

                            DataStorage.connectionList[i].channelUsage += 0.4;
                        }
                    }
                }

                if (!isFound) {
                    // Channel log
                    DataStorage.channelLog.push({
                        fromApp: applicationWindow.appInfo.name,
                        toApp: null,
                        channelOut: query.channelId,
                        channelIn: null,
                        size: queryData.length
                    });
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
    },

    initScene() {
        setInterval(() => {
            // if (DataStorage.event.isDrag)
            this.calculateConnectionLines();
        }, 16);
    }
};

export default SceneApi;