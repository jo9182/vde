// Convert unix timestamp to date object
Number.prototype.toDate = function () {
    let date = new Date();
    date.setTime(this);
    return date;
};

// Convert seconds to HH:MM
Number.prototype.intToHM = function () {
    let sec_num = Math.abs(this);
    let hours = Math.floor(sec_num / 3600);
    let minutes = Math.floor((sec_num - (hours * 3600)) / 60);

    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;

    return hours + ':' + minutes;
};

// Convert seconds to HH:MM:SS
Number.prototype.intToHMS = function () {
    let sec_num = Math.abs(this);
    let hours = Math.floor(sec_num / 3600);
    let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    let sec = sec_num % 60;

    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (sec < 10) sec = "0" + sec;

    return hours + ':' + minutes + ':' + sec;
};

// Convert bytes to kb, mb and etc
Number.prototype.humanByteSize = function () {
    let bytes = this;
    let thresh = 1024;
    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    let units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + ' ' + units[u];
};

// Convert meters to km
Number.prototype.humanMeterSize = function () {
    if (this < 0) return '-';
    if (this < 1000) return Math.round(this) + ' м';
    else return (this / 1000).toFixed(2) + ' км';
};

// Convert big numbers to short
Number.prototype.humanReadableSize = function (precision, minimum) {
    if (!precision) precision = 1;
    if (!minimum) minimum = 10000;
    if (this >= 1000000) return (this / 1000000).toFixed(precision).replace(/\.0+$/, '') + 'm';
    if (this >= minimum) return (this / 1000).toFixed(precision).replace(/\.0+$/, '') + 'k';
    else return this.toFixed(precision);
};

// Get percent value from current number, ie 12 (50%) -> 6
Number.prototype.percentage = function (value, type) {
    if (type === 'sub') return this - (this * (value / 100));
    return this * (value / 100);
};

// Check if value located between two numbers
Number.prototype.between = function (min, max) {
    return (this >= min && this <= max);
};