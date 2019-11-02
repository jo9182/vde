let VDE = {
    sessionKey: '',

    lastMessageId: 0,
    callbackList: {},
    listenCallback: {},

    init: function () {
        this.sessionKey = window.location.hostname.split('.')[0];
        window.addEventListener("message", (event) => {
            // Channel data
            if (event.data.isChannelData) {
                if (this.listenCallback[event.data.channelId])
                    this.listenCallback[event.data.channelId](event.data.data);
                return;
            }

            // Callback message
            if (this.callbackList[event.data.messageId]) {
                if (event.data.status) {
                    this.callbackList[event.data.messageId].resolve(event.data.data);
                } else this.callbackList[event.data.messageId].reject(event.data.errorMessage);
            }
        });
    },
    async apiQuery(method, data) {
        this.callbackList[this.lastMessageId] = {
            resolve: null,
            reject: null
        };

        top.postMessage({
            messageId: this.lastMessageId,
            sessionKey: this.sessionKey,
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
            sessionKey: this.sessionKey,
            method: 'channelData',
            data: data
        }, '*');
    },
    listen(chId, callback) {
        this.listenCallback[chId] = callback;
    },
    async getInternalFile(path) {
        return await this.getRemoteFile(`/${path}`);
    },
    async getFile(path) {
        return await this.getRemoteFile(`/storage/${path}`);
    },
    saveFile(path, data) {
        let resolveMain = null;
        let rejectMain = null;
        let oReq = new XMLHttpRequest();
        oReq.onload = function() {
            if (this.status === 200) resolveMain(this.responseText);
            else rejectMain(this.responseText);
        };

        oReq.open("post", `/storage/${path}`, true);
        let formData = new FormData();
        // formData.append("path", path);
        formData.append("file", new Blob([data]), "content-file");
        oReq.send(formData);

        return new Promise(((resolve, reject) => {
            resolveMain = resolve;
            rejectMain = reject;
        }));
    },
    getRemoteFile(url, isBinary = false, throughServer = false) {
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

        if (throughServer) oReq.open("get", "/remote-resource/" + url, true);
        else oReq.open("get", url, true);

        oReq.send();
        return new Promise(((resolve, reject) => {
            resolveMain = resolve;
            rejectMain = reject;
        }));
    },
    getVueComponent(url) {
        return new Promise(async (resolve, reject) => {
            let pattern = await this.getInternalFile(url);
            let template = pattern.substring(
                pattern.lastIndexOf("<template>") + 10,
                pattern.lastIndexOf("</template>")
            );
            let script = pattern.substring(
                pattern.lastIndexOf("<script>") + 8,
                pattern.lastIndexOf("</script>")
            ).replace('export default {', '(() => { return {') + '})()';
            script = eval(script);

            resolve(Object.assign({
                template: template
            }, script));
        });
    }
};
