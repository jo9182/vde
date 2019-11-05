let VDE = {
    sessionKey: '',
    applicationData: {},

    // Callback list
    lastMessageId: 0,
    messageCallback: {},
    listenCallback: {},
    eventCallback: {},

    // Init application
    async init() {
        await this.documentIsReady();
        this.sessionKey = window.location.hostname.split('.')[0];
        window.addEventListener("message", (event) => {
            // Event
            if (event.data.isEvent) {
                if (this.eventCallback[event.data.event])
                    for (let i = 0; i < this.eventCallback[event.data.event].length; i++)
                        this.eventCallback[event.data.event][i](event.data.data);
                return;
            }

            // Channel data
            if (event.data.isChannelData) {
                if (this.listenCallback[event.data.channelId])
                    this.listenCallback[event.data.channelId](event.data.data);
                return;
            }

            // Callback message
            if (this.messageCallback[event.data.messageId]) {
                if (event.data.status) {
                    this.messageCallback[event.data.messageId].resolve(event.data.data);
                } else this.messageCallback[event.data.messageId].reject(event.data.errorMessage);
            }
        });
    },
    async initWithVue(config) {
        // Hide app
        this.hideApplication();

        // Start init
        await this.init();

        // Options
        if (config.options)
            config.data = Object.assign(config.data || {}, {
                optionsPattern: config.options,
                options: {}
            });

        // Load and register components
        if (config.components) {
            for (let i = 0; i < config.components.length; i++) {
                let component = await this.getVueComponent(config.components[i] + '.vue');
                Vue.component(config.components[i].replace(/\./g, '-'), component);
            }
        }

        // App data
        this.applicationData = config.data;

        // App skeleton
        const vueApp = new Vue({
            el: '#app',
            mounted: config.start,
            methods: config.method,
            data: () => this.applicationData
        });

        // Set tabs
        if (config.tabs) await VDE.apiQuery('setTabs', config.tabs);

        // Register options
        if (config.options)
            await this.registerApplicationOptions(
                this.applicationData.optionsPattern,
                this.applicationData.options);

        // Set event listeners
        if (config.event) {
            for (let eventName in config.event) {
                if (config.event.hasOwnProperty(eventName)) {
                    let boundFunc = config.event[eventName].bind(vueApp);
                    VDE.on(eventName, boundFunc);
                }
            }
        }

        // Show app
        this.showApplication();
    },

    // Api
    async apiQuery(method, data) {
        this.messageCallback[this.lastMessageId] = {
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
            this.messageCallback[this.lastMessageId - 1].resolve = resolve;
            this.messageCallback[this.lastMessageId - 1].reject = reject;
        });
    },

    // Other
    async registerApplicationOptions(optionsPattern, options, onChange) {
        await VDE.apiQuery('setOptions', optionsPattern);
        VDE.on('optionsChanged', async (savedOptions) => {
            for (let option in savedOptions)
                if (savedOptions.hasOwnProperty(option))
                    options[option] = savedOptions[option].value;
            if (onChange) onChange();
        });
    },
    on(eventName, callback) {
        // Add listener to queue
        if (!this.eventCallback[eventName])
            this.eventCallback[eventName] = [];
        this.eventCallback[eventName].push(callback);
    },

    // Channel
    sendChannelData(chId, data) {
        top.postMessage({
            channelId: chId,
            sessionKey: this.sessionKey,
            method: 'channelData',
            data: data
        }, '*');
    },
    listenChannelData(chId, callback) {
        this.listenCallback[chId] = callback;
    },

    // File functions
    async getInternalFile(path, format = null) {
        let resource = await this.getRemoteFile(`/${path}`);
        if (format === 'json') resource = JSON.parse(resource);
        return resource;
    },
    async getFile(path, format = null) {
        let resource = await this.getRemoteFile(`/storage/${path}`);
        if (format === 'json') resource = JSON.parse(resource);
        return resource;
    },
    async fileExists(path) {
        let response = await fetch(`/api/file/exists/${path}`);
        return response.ok;
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
    },

    // Document functions
    documentIsReady() {
        return new Promise(resolve => {
            window.addEventListener('load', () => {
                resolve();
            });
        });
    },
    showApplication() {
        document.querySelector('body').style.display = 'flex';
    },
    hideApplication() {
        document.querySelector('body').style.display = 'none';
    }
};
