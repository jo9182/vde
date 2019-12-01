const Fs = require('fs');
const MD5 = require('md5');
const EMail = require('nodemailer');

let ServerUserApi = {
    users: [],
    // Load and init users
    load: () => {
        this.users = JSON.parse(Fs.readFileSync('./storage/user.list.json', 'utf-8'));

        for (let i = 0; i < this.users.length; i++) {
            let user = this.users[i];

            // Init defaults folder
            Fs.mkdirSync(`./storage/user/${user.name}/bin`, { recursive: true });
            Fs.mkdirSync(`./storage/user/${user.name}/data`, { recursive: true });
            Fs.mkdirSync(`./storage/user/${user.name}/docs`, { recursive: true });

            // Generate session access token
            user.accessToken = MD5(Math.random() + Math.random());
        }
    },
    // Auth user by login and password
    auth: (login, password) => {
        for (let i = 0; i < this.users.length; i++)
            if (this.users[i].name === login && this.users[i].password === password)
                return this.users[i].accessToken;
        return null;
    },
    // Find user
    findBy: (query, by = 'accessToken') => {
        for (let i = 0; i < this.users.length; i++)
            if (this.users[i][by] === query) return this.users[i];
        return null;
    },

    // Send email to user account
    async sendEmail(user, to, subject, message) {
        if (!user.mail || !user.email) return;

        let transporter = EMail.createTransport({
            host: user.mail.host,
            port: user.mail.port,
            secure: user.mail.secure,
            auth: {
                user: user.mail.user,
                pass: user.mail.password
            }
        });

        try {
            return await transporter.sendMail({
                from: user.mail.user,
                to: to || user.email,
                subject: subject,
                text: message
            });
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
};

module.exports = ServerUserApi;