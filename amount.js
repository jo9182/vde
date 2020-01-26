const RecursiveReaddir = require("recursive-readdir");
const Fs = require('fs');

(async () => {
    let c = [
        ...await RecursiveReaddir('./server'),
        ...await RecursiveReaddir('./resource'),
        ...await RecursiveReaddir('./storage/user/root/bin'),
    ].filter(x => {
        // if (!x.match(/draw-studio/)) return false;
        if (x.match(/vue\.js/) || x.match(/vue\.prod\.js/) || x.match(/\.min\.js/)) return false;
        if (x.match(/storage/) && x.match(/user/) && x.match(/bin/) && x.match(/lib/)) return false;
        return x.match(/\.(vue|js|scss|ts|html)$/);
    });
    let x = c.map((x) => {
        return Fs.readFileSync(x, 'utf-8').split('\n').length;
    });
    let total = x.reduce((a, b) => a + b, 0);
    console.log(c);
    console.log(x);
    console.log(total);
})();