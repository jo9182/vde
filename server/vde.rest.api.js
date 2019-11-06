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
const WebSocket = require('ws');
const Net = require('net');
const RecursiveReaddir = require("recursive-readdir");

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
        // Check if file exists
        '^/api/file/exists/:location([a-z]+)/:path(*)': (req, res) => {
            let access = AccessBySubDomain(req.headers.host);
            if (!access) return error(res);
            let path = req.params.path;
            let location = req.params.location;

            switch (location) {
                case 'internal':
                    if (Fs.existsSync(Path.resolve(__dirname + '/../', `${access.app.path}/${path}`)))
                        res.send('OK');
                    else error(res);
                    break;
                case 'storage':
                    if (Fs.existsSync(Path.resolve(__dirname + '/../', `${access.app.storage}/${path}`)))
                        res.send('OK');
                    else error(res);
                    break;
                case 'docs':
                    if (Fs.existsSync(Path.resolve(__dirname + '/../', `${access.app.storage}/../../docs/${path}`)))
                        res.send('OK');
                    else error(res);
                    break;
                default:
                    error(res);
                    break;
            }
        },

        // Get file tree
        '^/api/file/tree/:filter([^/]+)/:location([a-z]+)/:path(*)': async (req, res) => {
            let access = AccessBySubDomain(req.headers.host);
            if (!access) return error(res);
            let path = SafePath(req.params.path);
            let location = req.params.location;
            let filter = req.params.filter;
            let list = [];
            let absolutePath = '';

            switch (location) {
                case 'internal':
                    // Get file list
                    absolutePath = Path.resolve(__dirname + '/../', `${access.app.path}/${path}`);
                    list = await RecursiveReaddir(absolutePath);
                    break;
                case 'storage':
                    // Get file list
                    absolutePath = Path.resolve(__dirname + '/../', `${access.app.storage}/${path}`);
                    list = await RecursiveReaddir(absolutePath);
                    break;
                case 'docs':
                    // Get file list
                    absolutePath = Path.resolve(__dirname + '/../', `${access.app.storage}/../../docs/${path}`);
                    list = await RecursiveReaddir(absolutePath);
                    break;
                default:
                    return error(res);
            }

            // Send to client
            list = list.filter(x => {
                return x.match(new RegExp(filter));
            });
            list = list.map(x => {
                const stat = Fs.lstatSync(x);
                return {
                    file: x.replace(Path.resolve(__dirname + '/../', `${access.app.storage}/../../docs/`), '')
                        .replace(/\\/g, '/'),
                    isFolder: stat.isDirectory(),
                    size: Fs.statSync(x)['size'],
                    created: Fs.statSync(x)['birthtime'],
                }
            });
            res.send(JSON.stringify(list));
        },

        // Get file list
        '^/api/file/list/:filter([^/]+)/:location([a-z]+)/:path(*)': (req, res) => {
            let access = AccessBySubDomain(req.headers.host);
            if (!access) return error(res, 'Access denied');
            let path = SafePath(req.params.path);
            let location = req.params.location;
            let filter = req.params.filter;
            let list = [];
            let absolutePath = '';

            switch (location) {
                case 'internal':
                    // Get file list
                    absolutePath = Path.resolve(__dirname + '/../', `${access.app.path}/${path}`);
                    list = Fs.readdirSync(absolutePath);
                    break;
                case 'storage':
                    // Get file list
                    absolutePath = Path.resolve(__dirname + '/../', `${access.app.storage}/${path}`);
                    list = Fs.readdirSync(absolutePath);
                    break;
                case 'docs':
                    // Get file list
                    absolutePath = Path.resolve(__dirname + '/../', `${access.app.storage}/../../docs/${path}`);
                    list = Fs.readdirSync(absolutePath);
                    break;
                default:
                    return error(res, `Unknown "${location}" location`);
            }

            // Send to client
            list = list.filter(x => {
                return x.match(new RegExp(filter));
            });
            list = list.map(x => {
                const stat = Fs.lstatSync(absolutePath + '/' + x);
                return {
                    file: x,
                    isFolder: stat.isDirectory(),
                    size: Fs.statSync(absolutePath + '/' + x)['size'],
                    created: Fs.statSync(absolutePath + '/' + x)['birthtime'],
                }
            });
            list = list.sort().sort((a, b) => {
                return ~~b.isFolder - ~~a.isFolder;
            });
            res.send(JSON.stringify(list));
        },

        // Get data file
        '^/storage/:path(*)': (req, res) => {
            let access = AccessBySubDomain(req.headers.host);
            if (!access) return error(res);

            let path = SafePath(req.params.path);
            res.sendFile(Path.resolve(__dirname + '/../', `${access.app.storage}/${path}`));
        },

        // Get public user file
        '^/docs/:path(*)': (req, res) => {
            let access = AccessBySubDomain(req.headers.host);
            if (!access) return error(res);

            let path = SafePath(req.params.path);
            res.sendFile(Path.resolve(__dirname + '/../', `${access.app.storage}/../../docs/${path}`));
        },

        // Get public file
        '^/public/:path(*)': (req, res) => {
            let access = AccessBySubDomain(req.headers.host);
            if (!access) return error(res);

            let path = SafePath(req.params.path);
            res.sendFile(Path.resolve(__dirname + '/../', `public/${path}`));
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

        // Save public file
        '^/docs/:path(*)': (req, res) => {
            let access = AccessBySubDomain(req.headers.host);
            if (!access) return error(res);

            let path = SafePath(req.params.path);

            try {
                let file = req.files.file;
                let fileDataUploaded = Fs.readFileSync(file.path);
                Fs.writeFileSync(  `${access.app.storage}/../../docs/${path}`, fileDataUploaded);

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
        // Start rest server
        RestApp.listen(port, function () {
            console.log(`VDE Server starts at :${port}`);
        });

        // Start web socket server
        const wss = new WebSocket.Server({
            port: port + 1,
            perMessageDeflate: false
        });
        console.log(`VDE WebSocket Server starts at :${port + 1}`);

        let wssTable = {};
        wss.on('connection', function connection(ws, req) {
            ws.id = req.headers['sec-websocket-key'];
            wssTable[ws.id] = {
                upgrade: false
            };

            ws.on('message', function incoming(message) {
                if (!wssTable[ws.id].upgrade) {
                    wssTable[ws.id].upgrade = true;

                    let authPackage = JSON.parse(message);
                    let client = new Net.Socket();
                    wssTable[ws.id].client = client;
                    client.connect(authPackage.port, authPackage.host);
                    client.on('data', function(data) {
                        ws.send(data);
                    });
                    client.on('close', function(data) {
                        delete wssTable[ws.id];
                        ws.close();
                    });
                } else {
                    wssTable[ws.id].client.write(message);
                }
            });

            ws.on('close', function () {
                try { wssTable[ws.id].client.destroy(); }
                catch {}
                delete wssTable[ws.id];
            });
        });
    }
};