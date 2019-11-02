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

let AccessBySubDomain = (host) => {
    let subDomain = host.split('.')[0];
    if (!subDomain.includes('_')) return null;

    let accessToken = subDomain.split('_')[0];
    let applicationKey = subDomain.split('_')[1];

    // Get user
    let user = ServerUserApi.findBy(accessToken);
    if (!user) return null;

    // Get app
    let app = ServerAppApi.findBy(user, applicationKey, 'applicationKey');
    if (!app) return null;

    return {
        user,
        app,
        accessToken,
        applicationKey
    }
};

let RestAppMethodList = {
    get: {
        // Get global lib
        '^/storage/:file(*)': (req, res) => {
            let access = AccessBySubDomain(req.headers.host);
            if (!access) return error(res);

            let path = SafePath(req.params.file);
            res.sendFile(Path.resolve(__dirname + '/../', `${access.app.storage}/${path}`));
        },

        // Get global lib
        '^/lib/:file(*)': (req, res) => {
            let access = AccessBySubDomain(req.headers.host);
            if (!access) return error(res);

            let path = SafePath(req.params.file);
            res.sendFile(Path.resolve(__dirname + '/../', `./lib/${path}`));
        },

        // Get list of user applications
        '^/:file(*)': (req, res) => {
            let access = AccessBySubDomain(req.headers.host);
            if (!access) return error(res);

            let path = SafePath(req.params.file);
            res.sendFile(Path.resolve(__dirname + '/../', `${access.app.path}/${path}`));
        },
    },
    post: {

    },
    delete: {

    }
};

// Set post parsers
RestApp.use(BodyParser.urlencoded({extended: true}));
RestApp.use(BodyParser.json());

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
            console.log(`VDE Server starts at :${port}`);
        });
    }
};