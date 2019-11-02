import axios from "axios";

let UserApi = {
    async auth(login, password) {
        axios.post('/api/user/auth', {
            login: login,
            password: password
        }).then((r) => {
            localStorage.setItem('access_token', r.data);
            window.location.reload();
        }).catch(console.error);
    },
    async getUser() {
        try {
            let userData = await axios.get('/api/user', {
                headers: {
                    access_token: localStorage.getItem('access_token')
                }
            });
            return userData.data;
        }
        catch (e) {
            return null;
        }
    }
};

export default UserApi;