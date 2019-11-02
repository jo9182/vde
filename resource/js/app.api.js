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
    async list() {
        try {
            let data = await axios.get('/api/app/list', {
                headers: {
                    access_token: localStorage.getItem('accessToken')
                }
            });
            return data.data;
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