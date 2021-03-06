const Fs = require('fs');
const ServerRestAPI = require('./server/server.rest.api');
const VDERestAPI = require('./server/vde.rest.api');
const ServiceManager = require('./server/service.manager');
const Express = require('express');
const RestApp = Express();

require('dotenv').config();

// Don't know but make send email works
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Create default folders
Fs.mkdirSync('./public', { recursive: true });
Fs.mkdirSync('./storage/user', { recursive: true });

// Create default user list
if (!Fs.existsSync('./storage/user.list.json')) {
    Fs.writeFileSync('./storage/user.list.json', JSON.stringify([{
        name: 'root',
        password: process.env.DEFAULT_ROOT_PASSWORD || 'root'
    }]));
}

// Start rest server
ServerRestAPI.run(process.env.SERVER_PORT);
VDERestAPI.run(process.env.VDE_PORT);
ServiceManager.run(process.env.SERVICE_PORT);

// Start rest server
RestApp.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next()
});
RestApp.listen(process.env.GIT_PORT, () => { console.log(`Git server starts at :${process.env.GIT_PORT}`) });
RestApp.post(`/git-push/${process.env.GIT_WEB_HOOK_PATH}`, (req, res) => {
    res.send('OK');
    process.exit();
});

/*const asc = require("assemblyscript/cli/asc");
const { binary, text, stdout, stderr } = asc.compileString(`export function sas(x: u32, y: u32): u32 {
    return x + y;
}`);
console.log('s', binary);*/

/*asc.main([
    "myModule.ts",
    "--binaryFile", "myModule.wasm",
    "--optimize",
    "--sourceMap",
    "--measure"
], {
    stdout: process.stdout,
    stderr: process.stderr
}, function(err) {
    if (err)
        throw err
...
});*/
