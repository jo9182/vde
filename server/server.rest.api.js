const Path = require("path");
const Express = require('express');
const BodyParser = require("body-parser");
const RestApp = Express();
const ServerAppApi = require('./server.app.api');
const ServerUserApi = require('./server.user.api');

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
            res.send('gas');
        },
        // Get app version line
        '^/api/app/version-list': (req, res) => {
            res.send('sss');
        },

        // Get app resource file by url
        '^/api/app/file/:access_token([a-z0-9\\-]+)/:application_key([a-z0-9]+)/:path(*)': (req, res) => {
            let user = ServerUserApi.findBy(req.params.access_token);
            if (!user) return error(res);

            let app = ServerAppApi.findBy(user, req.params.application_key, 'applicationKey');
            if (!app) return error(res);

            let path = SafePath(req.params.path);
            res.sendFile(Path.resolve(__dirname + '/../', app.path + '/' + path));
        },
        // Get app resource file
        '^/api/app/file/:path(*)': (req, res) => {

        },
        // Get app data file
        '^/api/app/data-file/:path(*)': (req, res) => {

        },
        // Get remote resource
        '^/api/remote-resource/:url(*)': (req, res) => {

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
        // Save app data file
        '^/api/app/data-file': (req, res) => {

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
        }
    },
    delete: {
        // Remove app
        '^/api/app': (req, res) => {

        },
        // Remove app data file
        '^/api/app/data-file/:path(*)': (req, res) => {

        },
        // Remove all app data
        '^/api/app/data': (req, res) => {

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