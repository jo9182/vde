const child_process = require('child_process');
const fs = require('fs');

let AppHelper = {
    getAppByName(user, appName) {
        let installedApps = JSON.parse(fs.readFileSync('./storage/user/maldan/app.json', 'utf-8'));
        for (let i = 0; i < installedApps.length; i++)
            if (installedApps[i].name === appName) return installedApps[i];
        return null;
    },
    updateAppConfig(user, appName, config) {
        let installedApps = JSON.parse(fs.readFileSync('./storage/user/maldan/app.json', 'utf-8'));
        for (let i = 0; i < installedApps.length; i++)
            if (installedApps[i].name === appName) {
                installedApps[i] = Object.assign(installedApps[i], config);
                break;
            }
        // Write files
        fs.writeFileSync('./storage/user/maldan/app.json', JSON.stringify(installedApps));
        return null;
    },
};

let GitApi = {
    installAppFromRepo(repoUrl) {
        let folderName = repoUrl.split('/').slice(-2);
        folderName = folderName.map(x => x.replace('.git', '')
            .replace('.', '_'))
            .join('_') + '_4';
        let finalPath = 'storage/user/maldan/bin/' + folderName;

        // Clone repo
        try {
            let s = child_process.execSync(`git clone ${repoUrl} ${finalPath}`);
            child_process.execSync(`cd ${finalPath} && git fetch && git fetch --tags`);

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

            return true;
        }
        catch (e) {
            console.log(e);
            return false;
        }
    },
    getAppVersionList(appName) {
        let installedApps = JSON.parse(fs.readFileSync('./storage/user/maldan/app.json', 'utf-8'));
        for (let i = 0; i < installedApps.length; i++) {
            // App found
            if (installedApps[i].name === appName) {
                let s = child_process.execSync(`cd ${installedApps[i].path} && git tag`);
                let v = [...s.toString().split('\n').reverse()];
                v.shift();
                v.unshift('latest');
                return v;
            }
        }

        return ['latest'];
    },
    getAppVersion(appName) {
        let installedApps = JSON.parse(fs.readFileSync('./storage/user/maldan/app.json', 'utf-8'));
        for (let i = 0; i < installedApps.length; i++) {
            // App found
            if (installedApps[i].name === appName) {
                let s = child_process.execSync(`cd ${installedApps[i].path} && git describe --tags`);
                return s.toString().trim();
            }
        }

        return ['latest'];
    },
    updateApp(user, appName) {
        // Search app
        let app = AppHelper.getAppByName(user, appName);
        if (!app) return false;

        // Update repo
        child_process.execSync(`cd ${app.path} && git pull && git fetch --all`);

        // Update new app info
        let appJson = JSON.parse(fs.readFileSync(app.path + '/application.json', 'utf-8'));
        AppHelper.updateAppConfig(user, appName, appJson);

        return true;
    },
    setAppVersion(appName, version) {
        let installedApps = JSON.parse(fs.readFileSync('./storage/user/maldan/app.json', 'utf-8'));
        for (let i = 0; i < installedApps.length; i++) {
            // App found
            if (installedApps[i].name === appName) {
                if (version === 'latest') child_process.execSync(`cd ${installedApps[i].path} && git checkout master`);
                else child_process.execSync(`cd ${installedApps[i].path} && git checkout ${version}`);
                return true;
            }
        }

        return false;
    }
};

module.exports = GitApi;