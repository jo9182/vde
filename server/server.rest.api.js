const Express = require('express');
const BodyParser = require("body-parser");
const RestApp = Express();
const ServerAppApi = require('./server.app.api');
const ServerUserApi = require('./server.user.api');

let RestAppMethodList = {
    get: {
        // Get list of user applications
        '^/api/app/list': (req, res) => {
            console.log(req.headers['accessToken']);
            res.send('sas');
        },
        // Get app current version
        '^/api/app/version': (req, res) => {
            res.send('gas');
        },
        // Get app version line
        '^/api/app/version-list': (req, res) => {
            res.send('sss');
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
    },
    post: {
        // Install app from repo
        '^/api/app/install': (req, res) => {

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