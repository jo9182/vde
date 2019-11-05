const Path = require("path");
const Express = require('express');
const BodyParser = require("body-parser");
const RestApp = Express();
const ServerAppApi = require('./server.app.api');
const ServerUserApi = require('./server.user.api');
const Request = require('request');
const formidable = require('express-formidable');
const Fs = require('fs');
const SASS = require('node-sass');
const AutoPrefixer = require('autoprefixer');
const PostCSS = require('postcss');

let error = (res, msg = 'ERROR') => {
    res.status(400);
    res.send(msg);
};

let SafePath = (path) => {
    if (!path) return;
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

    let sessionData = ServerAppApi.sessionTable[subDomain];
    if (!sessionData) return null;

    return sessionData;
};

let ConvertFile = (path, res) => {
    let extension = Path.extname(path);

    // SCSS File to CSS
    if (extension === '.scss') {
        // Get file
        let fileContent = Fs.readFileSync(path, 'utf-8');

        // Transpile
        let result = SASS.renderSync({
            data: fileContent
        });

        // Autoprefix
        result = PostCSS([ AutoPrefixer ]).process(result.css).css;

        // Set headers
        res.setHeader('Content-Type', 'text/css');
        res.send(result);
        return true;
    }
    return false;
};

let RestAppMethodList = {
    get: {
        '^/api/file/exists/:path(*)': (req, res) => {
            let access = AccessBySubDomain(req.headers.host);
            if (!access) return error(res);
            let path = SafePath(req.params.path);

            if (Fs.existsSync(Path.resolve(__dirname + '/../', `${access.app.storage}/${path}`)))
                res.send('OK');
            else error(res);
        },

        // Get data file
        '^/storage/:path(*)': (req, res) => {
            let access = AccessBySubDomain(req.headers.host);
            if (!access) return error(res);

            let path = SafePath(req.params.path);
            res.sendFile(Path.resolve(__dirname + '/../', `${access.app.storage}/${path}`));
        },

        // Get global lib
        '^/lib/:path(*)': (req, res) => {
            let access = AccessBySubDomain(req.headers.host);
            if (!access) return error(res);

            let path = SafePath(req.params.path);
            res.sendFile(Path.resolve(__dirname + '/../', `./lib/${path}`));
        },

        // Get remote resource
        '^/remote-resource/:url(*)': (req, res) => {
            // Download remote file
            Request({
                method: 'GET',
                url: req.params.url,
                encoding: null
            }, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    res.set('Content-Type', response.headers['content-type']);
                    res.set('Content-Length', response.headers['content-length']);
                    res.send(body);
                }
                else {
                    res.status(404);
                    res.send('Not found');
                }
            });
        },

        // Get app file
        '^/:path(*)': (req, res) => {
            let access = AccessBySubDomain(req.headers.host);
            if (!access) return error(res);

            let path = SafePath(req.params.path);

            if (!ConvertFile(Path.resolve(__dirname + '/../', `${access.app.path}/${path}`), res))
                res.sendFile(Path.resolve(__dirname + '/../', `${access.app.path}/${path}`));
        },
    },
    post: {
        // Save data file
        '^/storage/:path(*)': (req, res) => {
            let access = AccessBySubDomain(req.headers.host);
            if (!access) return error(res);

            let path = SafePath(req.params.path);

            try {
                let file = req.files.file;
                let fileDataUploaded = Fs.readFileSync(file.path);
                Fs.writeFileSync(  `${access.app.storage}/${path}`, fileDataUploaded);

                res.send("OK");
            } catch (e) {
                console.error(e);
                res.status(404);
                res.send("ERROR");
            }
        },
    },
    delete: {

    }
};

// Set post parsers
RestApp.use(formidable());
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