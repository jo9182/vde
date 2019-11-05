import "../resource/scss/style.scss";
import "../resource/css/normalize.css";

import Vue from "vue";
import DataStorage from "../resource/js/data.storage.js";
import UserApi from "./js/user.api";
import SceneApi from "./js/scene.api";

// Load components
let components = ['draggable', 'application.icon', 'application.window'];
for (let i = 0; i < components.length; i++)
    Vue.component(components[i].replace(/\./g, '-'),
        require('../resource/component/' + components[i] + '.vue').default);

// Init app
window.onload = async () => {
    // Set global link
    window.DataStorage = DataStorage;

    // Set resolution change event
    DataStorage.screen.width = window.innerWidth;
    DataStorage.screen.height = window.innerHeight;
    DataStorage.screen.isMobile = DataStorage.screen.width <= 425;
    window.onresize = function() {
        DataStorage.screen.width = window.innerWidth;
        DataStorage.screen.height = window.innerHeight;
        DataStorage.screen.isMobile = DataStorage.screen.width <= 425;
    };

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