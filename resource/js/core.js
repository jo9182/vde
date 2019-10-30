import Storage from "./storage";
import axios from "axios";

let VDECore = {
    runApplication(appInfo) {
        console.log(appInfo);
        Storage.windowList.push(
            this.createWindow(appInfo, 100, 100, 720, 480, [])
        );
    },
    createWindow(appInfo, x, y, width, height, dependencies = []) {
        // Set props for deps
        for (let i = 0; i < dependencies.length; i++) {
            for (let j = 0; j < dependencies[i].applications.length; j++) {
                dependencies[i].applications[j].sessionId = Math.random() + '';
                dependencies[i].applications[j].input = [];
                dependencies[i].applications[j].output = [];
            }
        }

        return {
            sessionId: Math.random() + '',
            title: appInfo.title,
            appName: appInfo.name,
            x: x,
            y: y,
            width: appInfo.minWidth * 1 || width,
            height: appInfo.minHeight * 1 || height,
            minWidth: appInfo.minWidth * 1,
            minHeight: appInfo.minHeight * 1,
            zIndex: 0,
            isDraggable: false,
            url: appInfo.index,
            input: [],
            output: [],
            dependencies: dependencies
        }
    },
    findWindow(list, sessionId) {
        if (!list) return null;

        for (let i = 0; i < list.length; i++) {
            if (list[i].dependencies) {
                for (let j = 0; j < list[i].dependencies.length; j++) {
                    let found = this.findWindow(list[i].dependencies[j].applications, sessionId);
                    if (found) return found;
                }
            }

            if (list[i].sessionId === sessionId) {
                return list[i];
            }
        }
    },
    connectWindow(sessionId1, outCh, sessionId2, inCh) {
        let win1 = this.findWindow(Storage.windowList, sessionId1);
        let win2 = this.findWindow(Storage.windowList, sessionId2);
        if (!win1 || !win2) return;

        // Add connection
        Storage.connectionList.push({
            transmitter: win1,
            receiver: win2,
            outCh: outCh,
            inCh: inCh
        });
    },
    closeWindow(sessionId) {
        for (let i = 0; i < Storage.windowList.length; i++) {
            if (Storage.windowList[i].sessionId === sessionId) {
                Storage.windowList.splice(i, 1);
                break;
            }
        }
    },

    // Scene
    buildLines() {
        let lines = [];
        let linesCenter = [];

        for (let i = 0; i < Storage.connectionList.length; i++) {
            let connection = Storage.connectionList[i];
            let windowFromRef = Storage.windowSessionRef[connection.transmitter.sessionId];
            if (!windowFromRef) continue;
            let windowToRef = Storage.windowSessionRef[connection.receiver.sessionId];
            if (!windowToRef) continue;

            let from = windowFromRef.portLocation('output', 0);
            let to = windowToRef.portLocation('input', 0);
            if (!from || !to) continue;

            lines.push({
                from: from,
                to: to
            });
        }

        Storage.sceneLines = lines;
        Storage.sceneLinesCenter = linesCenter;
    },

    // Server side
    installApp(repoUrl) {
        axios.post("/install-app", {
            repo: repoUrl
        }).then((r) => {
            console.log(r);
        });
    },
    getApplicationList() {
        return axios.get("/app-list", {});
    },
    getApplicationVersionList(appName) {
        return axios.get("/app-version-list?app_name=" + appName, {});
    },
    getApplicationVersion(appName) {
        return axios.get("/app-version?app_name=" + appName, {});
    },
    setApplicationVersion(appName, appVersion) {
        return axios.get("/set-app-version?app_name=" + appName + '&app_version=' + appVersion, {});
    },
    updateApplication(appName) {
        return axios.get("/app-update?app_name=" + appName, {});
    }
};

export default VDECore;