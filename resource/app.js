import "../resource/scss/style.scss";
import "../resource/css/normalize.css";

import Vue from "vue";
import DataStorage from "../resource/js/data.storage.js";
import UserApi from "./js/user.api";
import SceneApi from "./js/scene.api";
import Axios from "axios";

// Default axios settings
Axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
Axios.defaults.headers.common['access_token'] = localStorage.getItem('accessToken');

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
    let onScreenResize = () => {
        DataStorage.screen.width = window.innerWidth;
        DataStorage.screen.height = window.innerHeight;
        DataStorage.screen.isMobile = DataStorage.screen.width <= 425;

        DataStorage.screen.iconWidth = '20%';
        DataStorage.screen.iconHeight = '200px';

        // Mobile L
        if (DataStorage.screen.width <= 768) {
            DataStorage.screen.iconWidth = '20%';
            DataStorage.screen.iconHeight = '140px';
        }

        // Mobile L
        if (DataStorage.screen.width <= 425) {
            DataStorage.screen.iconWidth = '25%';
            DataStorage.screen.iconHeight = '140px';
        }

        // Mobile Small
        if (DataStorage.screen.width <= 320) {
            DataStorage.screen.iconWidth = '25%';
            DataStorage.screen.iconHeight = '120px';
        }
    };
    window.onresize = onScreenResize;
    onScreenResize();

    // Prevent zoom on iOS
    document.addEventListener('touchmove', function (event) {
        event = event.originalEvent || event;
        event.preventDefault();
    }, {passive: false});

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

    // Init app
    const app = new Vue({
        el: '#app',
        data: DataStorage
    });

    // Show app after loading
    setTimeout(() => {
        document.querySelector("#app").style.display = "flex";
    });
};