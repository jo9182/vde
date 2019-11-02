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
    userApi: UserApi,
    appApi: AppApi,
};

export default DataStorage;