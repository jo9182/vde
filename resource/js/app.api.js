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
};

export default AppApi;