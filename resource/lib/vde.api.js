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

        let appIsReady = () => {};

        // Options
        if (config.options) {
            // Load saved options
            if (await VDE.fileExists('.options.json'))
                config.options = Object.assign(config.options, await VDE.getFile('.options.json', 'json'));

            // Set options to data
            config.data = Object.assign(config.data || {}, {
                optionsPattern: config.options,
                options: {}
            });

            // Fill options from optionsPattern
            for (let option in config.options)
                if (config.options.hasOwnProperty(option))
                    config.data.options[option] = config.options[option].value;
        }

        // Load and register components
        if (config.components) {
            for (let i = 0; i < config.components.length; i++) {
                let component = await this.getVueComponent(config.components[i] + '.vue');
                Vue.component(config.components[i].replace(/\./g, '-'), component);
            }
        }

        // App data
        this.applicationData = config.data;

        // Settings
        let settings = await VDE.apiQuery('getSettings');

        // App skeleton
        const vueApp = new Vue({
            el: '#app',
            mounted() {
                let args = {};
                try { args = JSON.parse(settings.args); }
                catch {}
                if (config.start)
                    appIsReady = config.start.bind(this);
            },
            methods: config.method,
            data: () => this.applicationData
        });

        // Set tabs
        if (config.tabs) await VDE.apiQuery('setTabs', config.tabs);

        // Set window size
        if (config.windowSize) await VDE.apiQuery('setWindowSize', config.windowSize);

        // Register options
        if (config.options)
            await this.registerApplicationOptions(
                this.applicationData.optionsPattern,
                this.applicationData.options);

        // Set event listeners
        if (config.event) {
            for (let eventName in config.event) {
                if (config.event.hasOwnProperty(eventName)) {
                    VDE.on(eventName, config.event[eventName].bind(vueApp));
                }
            }
        }

        // Set channel listeners
        if (config.channel) {
            for (let channelId in config.channel) {
                if (config.channel.hasOwnProperty(channelId)) {
                    VDE.channel.listen(channelId, config.channel[channelId].bind(vueApp));
                }
            }
        }

        // App is ready for usage
        appIsReady();

        await this.apiQuery("setApplicationIsReady");

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

            await this.saveFile('.options.json', JSON.stringify(savedOptions));
        });
    },
    on(eventName, callback) {
        // Add listener to queue
        if (!this.eventCallback[eventName])
            this.eventCallback[eventName] = [];
        this.eventCallback[eventName].push(callback);
    },
    tcpSocket(params) {
        let hostname = window.location.hostname.split('.').slice(-2).join('.');
        let socket = new WebSocket(`ws://${hostname}:3002`);

        if (params.event) {
            if (params.event.open) params.event.open = params.event.open.bind(socket);
            if (params.event.message) params.event.message = params.event.message.bind(socket);
            if (params.event.error) params.event.error = params.event.error.bind(socket);
            if (params.event.close) params.event.close = params.event.close.bind(socket);
        }

        socket.onopen = function() {
            // Send create package
            socket.send(JSON.stringify({ type: 'create', host: params.host, port: params.port }));

            if (params.event && params.event.open)
                params.event.open();
        };

        socket.onclose = function(event) {
            if (params.event && params.event.close)
                params.event.close(event.reason);
        };

        socket.onmessage = function(event) {
            if (params.event && params.event.message) {
                let reader = new FileReader();
                reader.onload = function() {
                    if (params.format === 'text') params.event.message(reader.result);
                    else params.event.message(new Uint8Array(reader.result));
                };

                if (params.format === 'text') reader.readAsText(event.data);
                else reader.readAsArrayBuffer(event.data);
            }
        };

        socket.onerror = function(error) {
            if (params.event && params.event.error)
                params.event.error(error.message);
        };
    },

    // Channel
    channel: {
        send(chId, data) {
            top.postMessage({
                channelId: chId,
                sessionKey: VDE.sessionKey,
                method: 'channelData',
                data: data
            }, '*');
        },
        listen(chId, callback) {
            VDE.listenCallback[chId] = callback;
        },
    },

    // File functions
    async getDocumentFile(path, format = null) {
        return await this.getFile(path, format, 'docs');
    },
    async getPublicFile(path, format = null) {
        return await this.getFile(path, format, 'public');
    },
    async getInternalFile(path, format = null) {
        return await this.getFile(path, format, 'internal');
    },
    async getStorageFile(path, format = null) {
        return await this.getFile(path, format, 'storage');
    },
    async getFile(path, format = null, location = 'storage') {
        let resource = null;
        if (location === 'internal') resource = await this.getRemoteFile(`/${path}`);
        if (location === 'storage') resource = await this.getRemoteFile(`/storage/${path}`);
        if (location === 'docs') resource = await this.getRemoteFile(`/docs/${path}`);
        if (location === 'public') resource = await this.getRemoteFile(`/public/${path}`);
        if (!resource) return null;
        if (format === 'json') resource = JSON.parse(resource);
        return resource;
    },
    async getFileList(path, location = 'storage', filter = '.*') {
        try {
            return JSON.parse(await this.getRemoteFile(`/api/file/list/${encodeURI(filter)}/${location}/${path}`));
        }
        catch { return []; }
    },
    async getFileTree(path, location = 'storage', filter = '.*') {
        try {
            return JSON.parse(await this.getRemoteFile(`/api/file/tree/${encodeURI(filter)}/${location}/${path}`));
        }
        catch { return []; }
    },
    async fileExists(path, location = 'storage') {
        let response = await fetch(`/api/file/exists/${location}/${path}`);
        return response.ok;
    },
    saveFile(path, data, location = 'storage') {
        let resolveMain = null;
        let rejectMain = null;
        let oReq = new XMLHttpRequest();
        oReq.onload = function() {
            if (this.status === 200) resolveMain(this.responseText);
            else rejectMain(this.responseText);
        };

        oReq.open("post", `/${location}/${path}`, true);
        let formData = new FormData();
        formData.append("file", new Blob([data]), "content-file");
        oReq.send(formData);

        return new Promise(((resolve, reject) => {
            resolveMain = resolve;
            rejectMain = reject;
        }));
    },
    async clearStorage() {
        let response = await fetch(`/storage`, { method: 'DELETE' });
        return response.ok;
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
