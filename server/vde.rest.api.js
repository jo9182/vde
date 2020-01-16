const Path = require("path");
const Express = require('express');
const BodyParser = require("body-parser");
const RestApp = Express();
const ServerAppApi = require('./server.app.api');
const ServerUserApi = require('./server.user.api');
const Request = require('request');
const Formidable = require('express-formidable');
const Fs = require('fs');
const SASS = require('node-sass');
const AutoPrefixer = require('autoprefixer');
const PostCSS = require('postcss');
const WebSocket = require('ws');
const Net = require('net');
const RecursiveReaddir = require("recursive-readdir");
const Rimraf = require('rimraf');
const DirTree = require("directory-tree");
const Tsc = require('typescript');
const Glob = require("glob");

let error = (res, msg = 'ERROR') => {
    res.status(400);
    res.send(msg);
};

let SafePath = (path) => {
    if (!path) return;
    for (let i = 0; i < 64; i++) {
        if (path[0] === '.' && path[1] === '.') path = path.substr(2, path.length);
        if (path[0] === '.' && path[1] === '/') path = path.substr(2, path.length);

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

let CompileSASS = (path, fileContent) => {
    // Transpile
    let result = SASS.renderSync({
        data: fileContent,
        includePaths: [path.split("/").slice(0, -1).join("/")]
    });

    // Autoprefix
    return PostCSS([ AutoPrefixer ]).process(result.css).css;
};

let CompileTS = (path, fileContent) => {
    let fileDir = require('path').dirname(path);

    // Get file
    // let fileContent = Fs.readFileSync(path, 'utf-8');
    fileContent = fileContent.replace(/\/\/\/ <reference path="(.*?)" \/>/g, (r1, r2) => {
        return Fs.readFileSync(fileDir + '/' + SafePath(r2), 'utf-8');
    });

    // Compile ts to js
    let result = Tsc.transpileModule(fileContent, {
        reportDiagnostics: true,
        compilerOptions: {
            removeComments: true,
            target: Tsc.ScriptTarget.ES2016
        }
    });

    return result.outputText;
};

let ConvertFile = (path, res) => {
    path = path.replace(/\\/g, '/');
    let extension = Path.extname(path);

    // Html tags
    if (Path.basename(path) === 'index.vue') {
        // Get file
        let fileContent = Fs.readFileSync(path, 'utf-8');
        let style = '';
        let html = '';
        let script = '';

        fileContent = fileContent.replace(/<template>(.*?)<\/template>/gms, (r1, r2) => {
            html = `<html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
                    <meta http-equiv="X-UA-Compatible" content="ie=edge">
                    <title>Application</title>
                    <!-- Std libs -->
                    <script src="/public/lib/vue.js"></script>
                    <script src="/public/lib/vde.api.js"></script>
                    <script src="/public/lib/vde.api2.ts"></script>
                    <script src="/public/lib/extender.js"></script>
                    <script src="/public/lib/vde.image.ts"></script>
                    <script src="/public/ui.js"></script>
                    <link rel="stylesheet" href="/public/ui.css">
                    <link rel="stylesheet" href="style.scss">
                    <style>%%STYLE%%</style>
                </head>
                <body>
                    <div id="app">
                        ${r2}
                    </div>
                    <script>
                        %%SCRIPT%%
                    </script>
                </body>
            </html>`;
            return '';
        });

        fileContent = fileContent.replace(/<style.*?>(.*?)<\/style>/gms, (r1, r2) => {
            style = CompileSASS(path, r2);
            return '';
        });

        fileContent = fileContent.replace(/<script.*?>(.*?)<\/script>/gms, (r1, r2) => {
            script = CompileTS(path, r2);
            return '';
        });

        // Set headers
        res.setHeader('Content-Type', 'text/html');
        res.send(html.replace('%%STYLE%%', style).replace('%%SCRIPT%%', script));
        return true;
    }

    // Html tags
    if (extension === '.html') {
        // Get file
        let fileContent = Fs.readFileSync(path, 'utf-8');

        // Replace tags
        fileContent = fileContent.replace('<!-- %STD_VUE_CONFIG% -->', [
            '<script src="/public/lib/vue.js"></script>',
            '<script src="/public/lib/vde.api.js"></script>',
            '<script src="/public/lib/extender.js"></script>',
            '<script src="/public/lib/vde.image.ts"></script>',
            '<script src="/public/ui.js"></script>',
            '<link rel="stylesheet" href="/public/ui.css">',
            '<link rel="stylesheet" href="style.scss">'
        ].join("\n"));

        fileContent = fileContent.replace('<!-- %STD_HEAD% -->', [
            '<meta charset="UTF-8">',
            '<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">',
            '<meta http-equiv="X-UA-Compatible" content="ie=edge">',
            '<title>Application</title>'
        ].join("\n"));

        // Set headers
        res.setHeader('Content-Type', 'text/html');
        res.send(fileContent);
        return true;
    }

    // SCSS File to CSS
    if (extension === '.scss') {
        // Get file
        let fileContent = Fs.readFileSync(path, 'utf-8');

        // Transpile
        /*let result = SASS.renderSync({
            data: fileContent,
            includePaths: [path.split("/").slice(0, -1).join("/")]
        });

        // Autoprefix
        result = PostCSS([ AutoPrefixer ]).process(result.css).css;*/

        // Set headers
        res.setHeader('Content-Type', 'text/css');
        res.send(CompileSASS(path, fileContent));
        return true;
    }

    // TypeScript File to JS
    if (extension === '.ts') {
        // Get file
        let fileContent = Fs.readFileSync(path, 'utf-8');

        /*let fileDir = require('path').dirname(path);


        fileContent = fileContent.replace(/\/\/\/ <reference path="(.*?)" \/>/g, (r1, r2) => {
            return Fs.readFileSync(fileDir + '/' + SafePath(r2), 'utf-8');
        });

        // Compile ts to js
        let result = Tsc.transpileModule(fileContent, {
            reportDiagnostics: true,
            compilerOptions: {
                removeComments: true,
                target: Tsc.ScriptTarget.ES2016
            }
        });*/

        // Set headers
        res.setHeader('Content-Type', 'application/javascript');
        res.send(CompileTS(path, fileContent));
        return true;
    }

    return false;
};

let FilterTree = (folder, filter) => {
    if (folder.files) folder = folder.files;

    for (let i = 0; i < folder.length; i++) {
        if (folder[i].isFolder) {
            if (folder[i].name !== "..")
                FilterTree(folder[i], filter);
        } else {
            // if (folder[i].name === "..") continue;
            if (!folder[i].name.match(filter)) {
                folder.splice(i, 1);
                i = -1;
            }
        }
    }

    folder.sort((a, b) => {
        if (a.name === ".." || b.name === "..") return 1;
        return !!b.isFolder - !!a.isFolder;
    });
};

let ConvertTree = (absolutePath, basePath, out, tree) => {
    let finalPath = tree.path.replace(basePath.replace(/\\/g, '/'), '');
    let absoluteFinalPath = tree.path.replace(absolutePath.replace(/\\/g, '/'), '');

    // console.log(finalPath, absoluteFinalPath);

    let folder;
    if (finalPath) {
        out[finalPath] = [];
        folder = out[finalPath];
    } else folder = out;

    folder.push({
        name: "..",
        isFolder: true,
        path: absoluteFinalPath.split("/").slice(0, -1).join("/")
    });

    for (let i = 0; i < tree.children.length; i++) {
        if (tree.children[i].type === 'directory') {
            let newFolder = [];
            folder.push({
                name: tree.children[i].name,
                path: absoluteFinalPath + '/' + tree.children[i].name,
                isFolder: true,
                created: tree.children[i].mtime,
                files: newFolder
            });

            ConvertTree(
                absolutePath,
                basePath + '/' + tree.children[i].name,
                newFolder,
                tree.children[i]
            );
        } else {
            folder.push({
                name: tree.children[i].name,
                path: absoluteFinalPath + '/' + tree.children[i].name,
                size: tree.children[i].size,
                created: tree.children[i].mtime
            });
        }
    }
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
            let filter = decodeURI(req.params.filter);
            let absolutePath = '';
            let tree = [];

            switch (location) {
                case 'internal':
                    // Get file list
                    absolutePath = Path.resolve(__dirname + '/../', `${access.app.path}/${path}`);

                    ConvertTree(
                        Path.resolve(__dirname + '/../', `${access.app.path}`),
                        Path.resolve(__dirname + '/../', `${access.app.path}`),
                        tree,
                        DirTree(absolutePath, { normalizePath: true, attributes: ['mtime'] }, null, null)
                    );
                    break;
                case 'storage':
                    // Get file list
                    absolutePath = Path.resolve(__dirname + '/../', `${access.app.storage}/${path}`);

                    ConvertTree(
                        Path.resolve(__dirname + '/../', `${access.app.storage}`),
                        Path.resolve(__dirname + '/../', `${access.app.storage}`),
                        tree,
                        DirTree(absolutePath, { normalizePath: true, attributes: ['mtime'] }, null, null)
                    );
                    break;
                case 'docs':
                    // Get file list
                    absolutePath = Path.resolve(__dirname + '/../', `${access.app.storage}/../../docs/${path}`);

                    //console.log(Path.resolve(__dirname + '/../', `${access.app.storage}/../../docs`));
                    //console.log(DirTree(absolutePath, { normalizePath: true, attributes: ['mtime'] }, null, null));

                    ConvertTree(
                        Path.resolve(__dirname + '/../', `${access.app.storage}/../../docs`),
                        Path.resolve(__dirname + '/../', `${access.app.storage}/../../docs`),
                        tree,
                        DirTree(absolutePath, { normalizePath: true, attributes: ['mtime'] }, null, null)
                    );
                    break;
                default:
                    return error(res);
            }

            if (tree[path]) tree = tree[path];

            // Filter tree
            FilterTree(tree, filter);

            // Send to client
            tree.splice(0, 1);

            res.send(JSON.stringify(tree));
        },

        // Get file list
        '^/api/file/list/:filter([^/]+)/:location([a-z]+)/:path(*)': (req, res) => {
            let access = AccessBySubDomain(req.headers.host);
            if (!access) return error(res, 'Access denied');
            let path = SafePath(req.params.path);
            let location = req.params.location;
            let filter = decodeURI(req.params.filter);
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
                    name: x,
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

        // Search files
        '^/api/file/search/:location([a-z]+)/:path(*)': (req, res) => {
            let access = AccessBySubDomain(req.headers.host);
            if (!access) return error(res, 'Access denied');
            let path = SafePath(req.params.path);
            let location = req.params.location;
            let filter = decodeURI(req.params.filter);
            let list = [];
            let absolutePath = '';

            switch (location) {
                case 'internal':
                    // Get file list
                    absolutePath = Path.resolve(__dirname + '/../', `${access.app.path}/${path}`);
                    list = Glob.sync(absolutePath);
                    break;
                case 'storage':
                    // Get file list
                    absolutePath = Path.resolve(__dirname + '/../', `${access.app.storage}/${path}`);
                    list = Glob.sync(absolutePath);
                    break;
                case 'docs':
                    // Get file list
                    absolutePath = Path.resolve(__dirname + '/../', `${access.app.storage}/../../docs/${path}`);
                    list = Glob.sync(absolutePath);
                    break;
                default:
                    return error(res, `Unknown "${location}" location`);
            }

            let rootPath = absolutePath.slice(0, -path.length).replace(/\\/g, '/');

            // Send to client
            list = list.map(x => {
                const stat = Fs.lstatSync(x);
                return {
                    name: x.replace(rootPath, '').split('/').pop(),
                    path: '/' + x.replace(rootPath, ''),
                    isFolder: stat.isDirectory(),
                    size: Fs.statSync(x)['size'],
                    created: Fs.statSync(x)['birthtime'],
                }
            });
            list = list.filter(x => !x.isFolder);
            res.send(JSON.stringify(list));
        },

        // Get data file
        '^/storage/:path(*)': (req, res) => {
            let access = AccessBySubDomain(req.headers.host);
            if (!access) return error(res);

            let path = SafePath(req.params.path);
            res.sendFile(Path.resolve(__dirname + '/../', `${access.app.storage}/${path}`), {
                dotfiles: "allow"
            });
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

            if (!ConvertFile(Path.resolve(__dirname + '/../', `public/${path}`), res))
                res.sendFile(Path.resolve(__dirname + '/../', `public/${path}`));
        },

        // Get global vue component
        /*'^/vue-component/:path(*)': (req, res) => {
            let access = AccessBySubDomain(req.headers.host);
            if (!access) return error(res);

            let path = SafePath(req.params.path);
            res.sendFile(Path.resolve(__dirname + '/../', `./resource/component/${path}`));
        },*/

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
            if (!path) {
                if (Fs.existsSync(Path.resolve(__dirname + '/../', `${access.app.path}/index.vue`))) {
                    path = 'index.vue';
                } else path = 'index.html';
            }

            if (!Fs.existsSync(Path.resolve(__dirname + '/../', `${access.app.path}/${path}`))) {
                return error(res, 'File not found');
            }

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
        // Clear storage
        '^/storage': (req, res) => {
            let access = AccessBySubDomain(req.headers.host);
            if (!access) return error(res);

            // Remove all files
            Rimraf.sync(Path.resolve(__dirname + '/../', `${access.app.storage}`) + '/{*,.*}');

            res.send('ok');
        },
    }
};

// Set post parsers
RestApp.use(Formidable());
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
            port: port * 1 + 1,
            perMessageDeflate: false
        });
        console.log(`VDE WebSocket Server starts at :${port * 1 + 1}`);

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