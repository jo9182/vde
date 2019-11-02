let VDE = {
    sessionId: '',
    appName: '',
    lastMessageId: 0,
    callbackList: {},
    listenCallback: {},

    init: async function () {
        let t = window.location
            .hash
            .replace('#', '')
            .split('&')
            .map(x => x.split('='));
        let obj = {};

        for (let i = 0; i < t.length; i++)
            obj[t[i][0]] = t[i][1];

        this.sessionId = obj['sessionId'];

        window.addEventListener("message", (event) => {
            if (event.data.isChannelData) {
                if (this.listenCallback[event.data.channelId])
                    this.listenCallback[event.data.channelId](event.data.data);
                return;
            }

            if (this.callbackList[event.data.messageId]) {
                if (event.data.status) {
                    this.callbackList[event.data.messageId].resolve(event.data.data);
                } else this.callbackList[event.data.messageId].reject(event.data.errorMessage);
            }
        });

        this.appName = await VDE.apiQuery('getAppName');
    },
    async apiQuery(method, data) {
        this.callbackList[this.lastMessageId] = {
            resolve: null,
            reject: null
        };

        top.postMessage({
            messageId: this.lastMessageId,
            sessionId: this.sessionId,
            method: method,
            data: data
        }, '*');
        this.lastMessageId++;

        return new Promise((resolve, reject) => {
            this.callbackList[this.lastMessageId - 1].resolve = resolve;
            this.callbackList[this.lastMessageId - 1].reject = reject;
        });
    },
    send(chId, data) {
        top.postMessage({
            channelId: chId,
            sessionId: this.sessionId,
            method: 'channelData',
            data: data
        }, '*');
    },
    listen(chId, callback) {
        this.listenCallback[chId] = callback;
    },
    async getAppDataFile(path) {
        return await this.helper.loadResource(`/get-app-data/${this.appName}/${path}`);
    },
    async saveAppFile(path, data) {
        let resolveMain = null;
        let rejectMain = null;
        let oReq = new XMLHttpRequest();
        oReq.onload = function() {
            if (this.status === 200) resolveMain(this.responseText);
            else rejectMain(this.responseText);
        };

        oReq.open("post", "/save-app-data", true);
        let formData = new FormData();
        formData.append("app_name", this.appName);
        formData.append("path", path);
        formData.append("file", new Blob([data]), "content-file");
        oReq.send(formData);

        return new Promise(((resolve, reject) => {
            resolveMain = resolve;
            rejectMain = reject;
        }));
    },

    helper: {
        loadResource(url, isBinary = false, throughServer = false) {
            let resolveMain = null;
            let rejectMain = null;
            let oReq = new XMLHttpRequest();
            oReq.onload = function() {
                if (isBinary) {
                    if (this.status === 200) resolveMain(new Uint8Array(this.response));
                    else rejectMain(new Uint8Array(this.response));
                } else {
                    if (this.status === 200) resolveMain(this.responseText);
                    else rejectMain(this.responseText);
                }
            };

            if (isBinary) oReq.responseType = "arraybuffer";

            if (throughServer) oReq.open("get", "/get-remote-resource/" + url, true);
            else oReq.open("get", url, true);

            oReq.send();
            return new Promise(((resolve, reject) => {
                resolveMain = resolve;
                rejectMain = reject;
            }));
        }
    }
};
