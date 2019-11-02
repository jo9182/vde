import "../resource/scss/style.scss";
import Vue from "vue";
import DataStorage from "../resource/js/data.storage.js";
import UserApi from "./js/user.api";

let components = ['draggable'];
for (let i = 0; i < components.length; i++)
    Vue.component(components[i], require('../resource/component/' + components[i] + '.vue').default);

// Init app
window.onload = async () => {
    window.DataStorage = DataStorage;

    let userData = await UserApi.getUser();
    if (userData) DataStorage.user = userData;

    const app = new Vue({
        el: '#app',
        data: DataStorage
    });
};