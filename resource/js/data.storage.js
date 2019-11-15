import UserApi from "./user.api";
import AppApi from "./app.api";
import SceneApi from "./scene.api";

let DataStorage = {
    user: null,
    windowList: [],
    connectionList: [],
    sceneLines: [],
    sceneLinesCenter: [],
    channelLog: [],

    applicationList: [],

    sessionWindow: {}, // SessionKey = IFrame Window

    input: {
        login: '',
        password: ''
    },
    dragData: {
        fromWindowSessionKey: null,
        data: null,
        port: null
    },
    event: {
        isDrag: false
    },
    userApi: UserApi,
    appApi: AppApi,
    sceneApi: SceneApi,

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