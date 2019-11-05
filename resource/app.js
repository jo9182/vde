import "../resource/scss/style.scss";
import "../resource/css/normalize.css";

import Vue from "vue";
import VueTouch from "vue-touch";
import DataStorage from "../resource/js/data.storage.js";
import UserApi from "./js/user.api";
import SceneApi from "./js/scene.api";

Vue.use(VueTouch);

// Load components
let components = ['draggable', 'application.icon', 'application.window'];
for (let i = 0; i < components.length; i++)
    Vue.component(components[i].replace(/\./g, '-'),
        require('../resource/component/' + components[i] + '.vue').default);

// Init app
window.onload = async () => {
    // Set global link
    window.DataStorage = DataStorage;

    // Load user data
    let userData = await UserApi.getUser();
    if (userData) {
        DataStorage.user = userData;

        // Load application list
        await SceneApi.reloadApplicationList();
    }

    // Init VDE Api
    SceneApi.initVDEApi();

    const app = new Vue({
        el: '#app',
        data: DataStorage
    });
};