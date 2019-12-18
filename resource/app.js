import "../resource/scss/style.scss";
import "../resource/css/normalize.css";

import Vue from "vue";
import DataStorage from "../resource/js/data.storage.js";
import UserApi from "./js/user.api";
import SceneApi from "./js/scene.api";
import Axios from "axios";
import Environment from "./js/environment";
import LongPress from 'vue-directive-long-press';

Vue.directive('long-press', LongPress);

// Default axios settings
Axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
Axios.defaults.headers.common['access_token'] = localStorage.getItem('accessToken');

// Load components
let components = ['draggable', 'application.icon', 'application.window', 'status.bar', 'system.settings'];
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

    // Init scene
    SceneApi.initScene();

    // Init environment
    Environment.init();

    // Init app
    const app = new Vue({
        el: '#app',
        data: DataStorage
    });

    // Show app after loading
    setTimeout(() => {
        document.querySelector("#app").style.display = "flex";
    });

    // Check update
    await SceneApi.checkUpdateForAllApplications();
};