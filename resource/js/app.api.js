import axios from "axios";

let AppApi = {
    async install(repo) {
        try {
            await axios.post('/api/app/install', { repo: repo }, {
                headers: {
                    access_token: localStorage.getItem('access_token')
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
                    access_token: localStorage.getItem('access_token')
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
    }
};

export default AppApi;