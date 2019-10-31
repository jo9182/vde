import "../resource/scss/style.scss";
import Vue from "vue";
import Storage from "../resource/js/storage.js";

let components = ['draggable'];
for (let i = 0; i < components.length; i++)
    Vue.component(components[i], require('../resource/component/' + components[i] + '.vue').default);

// Init app
window.onload = () => {
    const app = new Vue({
        el: '#app',
        data: Storage
    });
};