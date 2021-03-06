import axios from "axios";

let AppApi = {
    async install(repo) {
        try {
            await axios.post('/api/app/install', { repo: repo }, {
                headers: {
                    access_token: localStorage.getItem('accessToken')
                }
            });
            return true;
        }
        catch {
            return false;
        }
    },
    async pullUpdate(repo) {
        try {
            await axios.post('/api/app/pull-update', { repo: repo }, {
                headers: {
                    access_token: localStorage.getItem('accessToken')
                }
            });
            return true;
        }
        catch {
            return false;
        }
    },
    async checkUpdate(repo) {
        try {
            return (await axios.post('/api/app/check-update', { repo: repo }, {
                headers: {
                    access_token: localStorage.getItem('accessToken')
                }
            })).data;
        }
        catch {
            return false;
        }
    },
    async remove(repo) {
        try {
            await axios.delete(`/api/app/${repo}`, {
                headers: {
                    access_token: localStorage.getItem('accessToken')
                }
            });
            return true;
        }
        catch {
            return false;
        }
    },
    async list() {
        try {
            let data = await axios.get('/api/app/list', {
                headers: {
                    access_token: localStorage.getItem('accessToken')
                }
            });

            return data.data.sort((a, b) => {
                if (a.order === undefined) return 1;
                if (b.order === undefined) return -1;
                return ~~a.order - ~~b.order;
            });
        }
        catch {
            return [];
        }
    },
    async findBy(query, by = 'name') {
        let list = await this.list();
        for (let i = 0; i < list.length; i++)
            if (list[i][by] === query) return list[i];
        return null;
    },
    async getSessionKey(appName) {
        let key = await axios.post('/api/app/session', { app_name: appName }, {
            headers: {
                access_token: localStorage.getItem('accessToken')
            }
        });
        return key.data;
    },
    async saveSettings(appName, settings) {
        let key = await axios.post('/api/app/settings', { app_name: appName, settings: JSON.stringify(settings) }, {
            headers: {
                access_token: localStorage.getItem('accessToken')
            }
        });
        return key.data;
    },
    async destroySessionKey(sessionKey) {
        let key = await axios.delete(`/api/app/session/${sessionKey}`, {
            headers: {
                access_token: localStorage.getItem('accessToken')
            }
        });
        return key.data;
    }
};

export default AppApi;