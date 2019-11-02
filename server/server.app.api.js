const ChildProcess = require('child_process');
const Fs = require('fs');
const Rimraf = require("rimraf");
const MD5 = require("md5");

let ServerAppApi = {
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
            if (Fs.existsSync(`${finalPath}/icon.png`))
                appInfo.icon = `/app/${folderName}/icon.png`;

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
    updateConfig: () => {

    },
    // Pull update of application
    pullUpdate: () => {

    },
    // Get user application list
    list: (user) => {
        if (!Fs.existsSync(`./storage/user/${user.name}/app.json`)) return [];
        let list = JSON.parse(Fs.readFileSync(`./storage/user/${user.name}/app.json`, 'utf-8'));

        // Set application key
        for (let i = 0; i < list.length; i++) {
            list[i].applicationKey = MD5(user.accessToken + '_' + list[i].name).substr(16);
            if (list[i].icon)
                list[i].icon = `/api/app/file/${user.accessToken}/${list[i].applicationKey}/icon.png`;
        }

        return list;
    },

    // Remove application
    remove: () => {

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