import axios from "axios";
import DataStorage from "./data.storage";

let UserApi = {
    async auth(login, password) {
        axios.post('/api/user/auth', {
            login: login,
            password: password
        }).then((r) => {
            localStorage.setItem('accessToken', r.data);
            window.location.reload();
        }).catch((e) => {
            console.error(e);
            DataStorage.authForm.isError = true;
        });
    },
    async getUser() {
        try {
            let userData = await axios.get('/api/user', {
                headers: {
                    access_token: localStorage.getItem('accessToken')
                }
            });
            return userData.data;
        }
        catch (e) {
            return null;
        }
    },
    async sendEmail(to, subject, message) {
        return (await axios.post('/api/user/email', {to, subject, message})).data;
    },
    async logout() {
        localStorage.removeItem('accessToken');
        window.location.reload();
    }
};

export default UserApi;