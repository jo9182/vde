let express = require('express');
let app = express();

const path = require('path');
const fs = require('fs');
const bodyParser = require("body-parser");
const simpleGit = require('simple-git');
const serverGitApi = require('./server/server.git.api');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Install new application
app.post('^/install-app', async function (req, res) {
    let repo = req.body.repo;

    let status = serverGitApi.installAppFromRepo(repo);
    if (status) res.send('OK');
    else res.send('ERROR');

    /*child_process.exec(`git clone ${repo} ${finalPath}`, function (error, stdout, stderr) {
        if (error) {
            res.send('ERROR');
        } else {
            try {
                // Get installed apps
                let installedApps = JSON.parse(fs.readFileSync('./storage/user/maldan/app.json', 'utf-8'));

                // Parse info about application
                let appJson = JSON.parse(fs.readFileSync(finalPath + '/application.json', 'utf-8'));

                // Add new app
                installedApps.push({
                    title: appJson.title,
                    name: folderName,
                    path: finalPath,
                    index: `/app/${folderName}/index.html`,
                    icon: `/app/${folderName}/icon.png`,
                });

                // Write files
                fs.writeFileSync('./storage/user/maldan/app.json', JSON.stringify(installedApps));

                // Version info
                fs.writeFileSync(finalPath + '/.version.list', 'sas');

                res.send('OK');
            }
            catch (e) {
                res.send('ERROR');
            }
        }
    });*/
});

// Get app list
app.get('^/app-list', function (req, res) {
    // Get installed apps
    let installedApps = JSON.parse(fs.readFileSync('./storage/user/maldan/app.json', 'utf-8'));
    res.send(installedApps);
});

// Get app version list
app.get('^/app-version-list', function (req, res) {
    res.send(serverGitApi.getAppVersionList(req.query.app_name));
});

// Get app version
app.get('^/app-version', function (req, res) {
    res.send(serverGitApi.getAppVersion(req.query.app_name));
});

// Set app version
app.get('^/set-app-version', function (req, res) {
    res.send(serverGitApi.setAppVersion(req.query.app_name, req.query.app_version));
});

// Get application file
app.get('^/app/:file(*)', function (req, res) {
    let safePath = req.params.file.replace(/\.\./g, '').replace(/\\./g, '');
    console.log(safePath);
    res.sendFile(path.resolve(__dirname, "storage/user/maldan/bin/" + safePath));
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
app.use(express.static('public'));