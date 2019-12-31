const OS = require('os');

module.exports = {
    description: '',
    init() {

    },
    write(data) {
        if (data === 'showMemoryUsage') {
            this.emit({
                type: 'showMemoryUsage',
                data: [OS.freemem(), OS.totalmem()]
            });
        }
    }
};