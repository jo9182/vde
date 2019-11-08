// Convert string with date to date object
String.prototype.toDate = function () {
    let date = this;
    if (date.indexOf(' ') !== -1) date = date.replace(' ', 'T');

    let d;
    if (date.indexOf('T') !== -1) {
        d = new Date(date);
    } else {
        let t = date.split('-');
        if (t.length === 1) t = date.split('.');

        if (t[2] * 1 > 1000)
            d = new Date(Date.UTC(t[2] * 1, t[1] * 1 - 1, t[0] * 1));
        else
            d = new Date(Date.UTC(t[0] * 1, t[1] * 1 - 1, t[2] * 1));

        d.setUTCHours(0, 0, 0, 0);
    }

    return d;
};

// Extract from string all digits
String.prototype.digits = function () {
    return this.replace(/\D/g, "") * 1;
};

// Replace char at specific position
String.prototype.replaceAt = function (index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
};

// Convert dmy date to ymd
/**
 * @return {string}
 */
String.prototype.DMYToYMD = function () {
    let tuple = this.split('.');
    return tuple[2] + '-' + tuple[1] + '-' + tuple[0];
};

// Convert ymd to dmy
/**
 * @return {string}
 */
String.prototype.YMDToDMY = function () {
    let tuple = this.split('-');
    return tuple[2] + '.' + tuple[1] + '.' + tuple[0];
};

// Convert hours:minutes to int
/**
 * @return {number}
 */
String.prototype.HMToInt = function () {
    let hms = this + ':00';
    let a = hms.split(':');
    if (a.length === 1) return 0;
    return (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
};

// Human readable time, ie 22:30 -> 22 ч 30 мин
String.prototype.humanTime = function () {
    let tuple = this.split(':');
    tuple[0] *= 1;
    tuple[1] *= 1;
    if (tuple[2]) tuple[2] *= 1;

    if (tuple[0] === 0 && tuple[1] === 0) return tuple[2] + ' сек';
    if (tuple[0] === 0) return tuple[1] + ' мин';
    return tuple[0] + ' ч ' + tuple[1] + ' мин';
};

// Get string between two separators
String.prototype.between = function (first, last) {
    let f1 = this.indexOf(first);
    let f2 = this.indexOf(last);
    if (first === last)
        f2 = this.indexOf(last, 1);
    return this.substr(f1 + first.length, f2 - f1 - last.length);
};

// Get amount of specific char in string
String.prototype.count = function (char) {
    let out = 0;
    for (let i = 0; i < this.length; i++)
        if (this[i] === char) out += 1;
    return out;
};

// Convert snake to camel. Example sex_rock to sexRock
String.prototype.snakeToCamel = function () {
    return this.replace(/(_\w)/g, function (m) {
        return m[1].toUpperCase();
    });
};