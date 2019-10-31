const Fs = require('fs');
const ServerRestAPI = require('./server/server.rest.api');

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
ServerRestAPI.run(3000);