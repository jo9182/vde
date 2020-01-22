class VdeSystemApi {
    private _lastMessageId: number = 0;
    private _messageCallback: any = {};
    private _listenCallback: any = {};
    private _eventCallback: any = {};
    private _sessionKey: string = '';

    init() {
        // Get session key
        this._sessionKey = window.location.hostname.split('.')[0];

        // Add message listener
        window.addEventListener("message", (event: MessageEvent) => {
            // Event
            if (event.data.isEvent) {
                if (this._eventCallback[event.data.event])
                    for (let i = 0; i < this._eventCallback[event.data.event].length; i++)
                        this._eventCallback[event.data.event][i](event.data.data);
                return;
            }

            // Channel data
            if (event.data.isChannelData) {
                if (this._listenCallback[event.data.channelId])
                    this._listenCallback[event.data.channelId](event.data.data);
                return;
            }

            // Callback message
            if (this._messageCallback[event.data.messageId]) {
                if (event.data.status) {
                    this._messageCallback[event.data.messageId].resolve(event.data.data);
                } else this._messageCallback[event.data.messageId].reject(event.data.errorMessage);
            }
        });
    }

    query(method: string, data: any = null) {
        this._messageCallback[this._lastMessageId] = {
            resolve: null,
            reject: null
        };

        top.postMessage({
            messageId: this._lastMessageId,
            sessionKey: this._sessionKey,
            method: method,
            data: data
        }, '*');
        this._lastMessageId++;

        return new Promise((resolve, reject) => {
            this._messageCallback[this._lastMessageId - 1].resolve = resolve;
            this._messageCallback[this._lastMessageId - 1].reject = reject;
        });
    }

    async setWindowSize(width: number, height: number) {
        await this.query('setWindowSize', [width, height]);
    }
}