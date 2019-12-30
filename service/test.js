module.exports = {
    description: '',
    init() {
        setInterval(() => {
            this.emit(Math.random());
        }, 1000);
    },
    write(data) {
        console.log('write', data);
    }
};