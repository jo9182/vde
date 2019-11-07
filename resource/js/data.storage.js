import UserApi from "./user.api";
import AppApi from "./app.api";

let DataStorage = {
    user: null,
    windowList: [],
    connectionList: [],
    sceneLines: [],
    sceneLinesCenter: [],

    applicationList: [],

    sessionWindow: {}, // ID -> Window

    input: {
        login: '',
        password: ''
    },
    dragData: {
        fromWindow: null,
        data: null
    },
    userApi: UserApi,
    appApi: AppApi,

    device: {
        isMobile: typeof window.orientation !== 'undefined'
    },

    screen: {
        width: 0,
        height: 0,
        isMobile: false,
        iconWidth: '20%',
        iconHeight: '200px'
    },
};

export default DataStorage;