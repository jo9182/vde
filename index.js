let express = require('express');
const formidable = require('express-formidable');
const multiparty = require('multiparty');
const multipart = require('connect-multiparty');
const multer = require('multer');
const multerUpload = multer();
const pino = require('pino');
const logger = pino({
    prettyPrint: { colorize: true, translateTime: true, levelFirst: true },
    // translateTime: true
});

let app = express();

const path = require('path');
const fs = require('fs');
const bodyParser = require("body-parser");
const serverGitApi = require('./server/server.git.api');
const request = require('request');

// app.use(multerUpload.array());
app.use(formidable());
// app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

logger.info('hello world');

// Install new application
app.post('^/install-app', async function (req, res) {
    console.log(req.fields);
    let repo = req.fields.repo;

    let status = serverGitApi.installAppFromRepo(repo);
    if (status) res.send('OK');
    else res.send('ERROR');
});

// Get app list
app.get('^/app-list', function (req, res) {
    // Get installed apps
    let installedApps = JSON.parse(fs.readFileSync('./storage/user/maldan/app.json', 'utf-8'));
    res.send(installedApps);
});

// Remove app
app.get('^/remove-app', function (req, res) {
    res.send(serverGitApi.removeAppByRepo('maldan', req.query.repo));
});

// Get app version list
app.get('^/app-version-list', function (req, res) {
    res.send(serverGitApi.getAppVersionList(req.query.app_name));
});

// Get app version
app.get('^/app-version', function (req, res) {
    res.send(serverGitApi.getAppVersion(req.query.app_name));
});

// Update app
app.get('^/app-update', function (req, res) {
    res.send(serverGitApi.updateApp('maldan', req.query.app_name));
});

// Set app version
app.get('^/set-app-version', function (req, res) {
    res.send(serverGitApi.setAppVersion(req.query.app_name, req.query.app_version));
});

// Get application file
app.get('^/app/:file(*)', function (req, res) {
    let safePath = req.params.file.replace(/\.\./g, '').replace(/\\./g, '');
    res.sendFile(path.resolve(__dirname, "storage/user/maldan/bin/" + safePath));
});

// Get app data
app.get('^/get-app-data/:app_name([a-zA-Z_0-9-]+)/:file(*)', function (req, res) {
    let safePath = req.params.file.replace(/\.\./g, '').replace(/\\./g, '');
    console.log(safePath);
    res.sendFile(path.resolve(__dirname, "storage/user/maldan/data/" + req.params.app_name + "/" + safePath));
});

// Get app data
app.get('^/get-remote-resource/:url(*)', function (req, res) {
    // Download remote file
    request({
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
});

// Save app data
app.post('^/save-app-data', async function (req, res) {
    try {
        let appName = req.fields.app_name;
        let safePath = req.fields.path;
        safePath = safePath.replace(/\.\./g, '').replace(/\\./g, '');
        let file = req.files.file;

        let fileDataUploaded = fs.readFileSync(file.path);
        fs.writeFileSync(`./storage/user/maldan/data/${appName}/${safePath}`, fileDataUploaded);

        res.send("OK");
    } catch (e) {
        res.status(404);
        res.send("ERROR");
    }
});

// Start server
app.listen(3000, function () {
    logger.info('Example app listening on port 3000!');
});
app.use(express.static('public'));