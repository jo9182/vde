const Fs = require('fs');
const ServerRestAPI = require('./server/server.rest.api');
const VDERestAPI = require('./server/vde.rest.api');
const Express = require('express');
const RestApp = Express();
require('dotenv').config();

// Create default folders
Fs.mkdirSync('./public', { recursive: true });
Fs.mkdirSync('./storage/user', { recursive: true });

// Create default user list
if (!Fs.existsSync('./storage/user.list.json')) {
    Fs.writeFileSync('./storage/user.list.json', JSON.stringify([{
        name: 'root',
        password: '1234'
    }]));
}

// Start rest server
ServerRestAPI.run(process.env.SERVER_PORT);
VDERestAPI.run(process.env.VDE_PORT);

// Start rest server
RestApp.listen(process.env.GIT_PORT, () => { console.log(`Git server starts at :${process.env.GIT_PORT}`) });
RestApp.get(`/git-pull/${process.env.GIT_WEB_HOOK_PATH}`, () => {
    process.exit();
});