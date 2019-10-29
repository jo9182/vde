import Style from "../resource/scss/style.scss";
import Vue from "vue";
import Scene from "../resource/js/scene.js"
import Storage from "../resource/js/storage.js"
import VDECore from "../resource/js/core.js"

Vue.component('application-window', require('../resource/component/application.window.vue').default);
Vue.component('application-icon', require('../resource/component/application.icon.vue').default);
Vue.component('resizable', require('../resource/component/resizable.vue').default);

// Init app
const app = new Vue({
    el: '#app',
    data: Storage
});

window.VDECore = VDECore;

// Init scene
Scene.init();