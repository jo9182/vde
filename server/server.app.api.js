const ChildProcess = require('child_process');
const Fs = require('fs');
const Rimraf = require("rimraf");
const MD5 = require("md5");

let ServerAppApi = {
    sessionTable: {},

    // Install application from repo
    install: (user, repoURL) => {
        let folderName = repoURL.split('/').slice(-2);
        folderName = folderName.map(x => x.replace('.git', '')
            .replace('.', '_'))
            .join('_');
        let finalPath = `./storage/user/${user.name}/bin/${folderName}`;
        let storagePath = `./storage/user/${user.name}/data/${folderName}`;

        // App already installed
        if (Fs.existsSync(finalPath))
            return false;

        // Clone repo
        try {
            // Clone and fetch repo
            ChildProcess.execSync(`git clone ${repoURL} ${finalPath}`);
            ChildProcess.execSync(`cd ${finalPath} && git fetch && git fetch --tags`);

            // Get installed apps
            let installedApps = ServerAppApi.list(user);

            // Parse info about application
            let appJson = JSON.parse(Fs.readFileSync(`${finalPath}/application.json`, 'utf-8'));

            // Add new app
            let appInfo = Object.assign(appJson, {
                name: folderName,
                path: finalPath,
                storage: storagePath,
                repo: repoURL,
                index: `/app/${folderName}/index.html`
            });

            // Just in case
            delete appInfo.icon;
            if (Fs.existsSync(`${finalPath}/icon.png`)) {
                // Icon path
                appInfo.icon = `/app_icon/${folderName}_icon.png`;

                // Create icon folder
                Fs.mkdirSync(`./public/app_icon`, {recursive: true});

                // Copy icon
                Fs.copyFileSync(`${finalPath}/icon.png`, `./public/app_icon/${folderName}_icon.png`);
            }

            // Add to app list
            installedApps.push(appInfo);

            // Write files
            Fs.writeFileSync(`./storage/user/${user.name}/app.json`, JSON.stringify(installedApps));

            // Create data folder
            Fs.mkdirSync(`./storage/user/${user.name}/data/${folderName}`, {recursive: true});

            return true;
        } catch (e) {
            console.error(e);
            Rimraf.sync(finalPath);
            return false;
        }
    },
    // Update application config
    updateSettings: (user, appName, settings) => {
        let list = ServerAppApi.list(user);
        for (let i = 0; i < list.length; i++)
            if (list[i].name === appName)
                list[i].settings = settings;

        // Update app list
        Fs.writeFileSync(`./storage/user/${user.name}/app.json`, JSON.stringify(list));
    },
    // Pull update of application
    pullUpdate: (user, repo) => {
        return new Promise(((resolve, reject) => {
            let app = ServerAppApi.findBy(user, repo, 'repo');
            if (!app) return reject();

            ChildProcess.exec(`cd ${app.path} && git pull && git fetch --tags`, (err, out, code) => {
                if (err) reject();
                else resolve();
            });
        }));
    },
    // Get user application list
    list: (user) => {
        if (!Fs.existsSync(`./storage/user/${user.name}/app.json`)) return [];
        return JSON.parse(Fs.readFileSync(`./storage/user/${user.name}/app.json`, 'utf-8'));
    },

    // Remove application
    remove: (user, repo) => {
        if (!Fs.existsSync(`./storage/user/${user.name}/app.json`)) return false;
        let list = JSON.parse(Fs.readFileSync(`./storage/user/${user.name}/app.json`, 'utf-8'));

        for (let i = 0; i < list.length; i++) {
            if (list[i].repo === repo) {
                // Remove folder
                Rimraf.sync(list[i].path);

                list.splice(i, 1);
                break;
            }
        }

        // Write files
        Fs.writeFileSync(`./storage/user/${user.name}/app.json`, JSON.stringify(list));
        return true;
    },
    // Remove application data file
    removeDataFile: () => {

    },
    // Erase all application data
    eraseData: () => {

    },

    // Find application
    findBy: (user, query, by = 'name') => {
        let list = ServerAppApi.list(user);
        for (let i = 0; i < list.length; i++)
            if (list[i][by] === query)
                return list[i];
        return null;
    },

    // Set application version
    setVersion: () => {

    },
    // Get application list
    getVersion: () => {

    },
    // Get all version list of application
    getVersionList: () => {

    }
};

module.exports = ServerAppApi;