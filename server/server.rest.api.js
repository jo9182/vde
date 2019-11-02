const Path = require("path");
const Express = require('express');
const BodyParser = require("body-parser");
const RestApp = Express();
const ServerAppApi = require('./server.app.api');
const ServerUserApi = require('./server.user.api');
const MD5 = require('md5');

let error = (res, msg = 'ERROR') => {
    res.status(400);
    res.send(msg);
};

let SafePath = (path) => {
    for (let i = 0; i < 32; i++) {
        if (path[0] === '.') path = path.substr(1, path.length);

        path = path.replace(/\\/g, '/');
        path = path.replace(/\.\./g, '.');
        path = path.replace(/\/\.\//g, '');
    }
    return path;
};

let RestAppMethodList = {
    get: {
        // Get list of user applications
        '^/api/app/list': (req, res) => {
            let user = ServerUserApi.findBy(req.headers['access_token']);
            if (!user) return error(res);
            res.send(ServerAppApi.list(user));
        },
        // Get app current version
        '^/api/app/version': (req, res) => {
            console.log(req.headers.host);
            res.send('gas');
        },
        // Get app version line
        '^/api/app/version-list': (req, res) => {
            res.send('sss');
        },

        // Get user
        '^/api/user': (req, res) => {
            let user = ServerUserApi.findBy(req.headers['access_token']);
            if (!user) return error(res);
            else res.send(JSON.stringify(user));
        },
    },
    post: {
        // Install app from repo
        '^/api/app/install': async (req, res) => {
            let user = ServerUserApi.findBy(req.headers['access_token']);
            if (!user) return error(res);

            let result = await ServerAppApi.install(user, req.body.repo);
            if (!result) return error(res);
            res.send('OK');
        },
        // Set app version
        '^/api/app/version': (req, res) => {

        },

        // Update app
        '^/api/app/pull-update': (req, res) => {

        },
        // Auth user
        '^/api/user/auth': (req, res) => {
            let accessToken = ServerUserApi.auth(req.body.login, req.body.password);
            if (accessToken) res.send(accessToken);
            else {
                res.status(400);
                res.send('ERROR');
            }
        },

        // Sign app session
        '^/api/app/session': (req, res) => {
            let user = ServerUserApi.findBy(req.headers['access_token']);
            if (!user) return error(res);

            let app = ServerAppApi.findBy(user, req.body.app_name, 'name');
            if (!app) return error(res);

            let key = MD5(req.body.access_token + req.body.app_name + Math.random());
            ServerAppApi.sessionTable[key] = {user, app};

            res.send(key);
        },
    },
    delete: {
        // Remove app
        '^/api/app': (req, res) => {

        },
        // Delete app session
        '^/api/app/session/:session_key(*)': (req, res) => {
            let user = ServerUserApi.findBy(req.headers['access_token']);
            if (!user) return error(res);

            delete ServerAppApi.sessionTable[req.param.session_key];
            res.send('ok');
        },
    }
};

// Set post parsers
RestApp.use(BodyParser.urlencoded({extended: true}));
RestApp.use(BodyParser.json());

// Set public folder
RestApp.use(Express.static('public'));

// Set get methods
for (let getMethod in RestAppMethodList.get)
    if (RestAppMethodList.get.hasOwnProperty(getMethod))
        RestApp.get(getMethod, RestAppMethodList.get[getMethod]);

// Set post methods
for (let getMethod in RestAppMethodList.post)
    if (RestAppMethodList.post.hasOwnProperty(getMethod))
        RestApp.post(getMethod, RestAppMethodList.post[getMethod]);

// Set delete methods
for (let getMethod in RestAppMethodList.delete)
    if (RestAppMethodList.delete.hasOwnProperty(getMethod))
        RestApp.delete(getMethod, RestAppMethodList.delete[getMethod]);

module.exports = {
    run: function (port) {
        RestApp.listen(port, function () {
            console.log(`Server starts at :${port}`);

            // Load user list
            ServerUserApi.load();
        });
    }
};