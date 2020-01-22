let DateHelper = {
    // Get current date without time
    today(offsetDay) {
        let today = new Date();
        today.setDate(today.getDate() + ~~offsetDay);
        let dd = today.getDate();
        let mm = today.getMonth() + 1;
        let yyyy = today.getFullYear();

        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;

        return [yyyy, mm, dd].join('-');
    },
    // Convert ymd to date object
    fromYMD(y, m, d) {
        d = new Date(Date.UTC(y, m - 1, d));
        d.setUTCHours(0, 0, 0, 0);
        return d;
    },
    // Get start of week from current day
    startOfWeek(d, offset) {
        d = d ?new Date(d) :new Date();
        let day = d.getDay();
        let diff = d.getDate() - day + (day === 0 ? -6 : 1);
        let monday = new Date(d.setDate(diff + ~~offset));
        return monday.toYMD();
    }
};

// Get start of week from current date
Date.prototype.startOfWeek = function(offset) {
    let day = this.getDay();
    let diff = this.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(this.setDate(diff + ~~offset));
};

// Get start of month from current date
Date.prototype.startOfMonth = function(offset) {
    let d = new Date(this);
    d.setUTCDate(1 + offset);
    return d;
};

// Get list of dates from start of week
Date.prototype.getWeekRange = function() {
    let out = [];
    for (let i = 0; i < 7; i++) out.push(this.startOfWeek(i));
    return out;
};

// Get list of dates from start of month
Date.prototype.getMonthRange = function() {
    let out = [];
    for (let i = 0; i < 32; i++) {
        let d = new Date(this);
        d.setUTCDate(1 + i);
        if (d.getMonth() !== this.getMonth()) break;
        out.push(d);
    }

    return out;
};

// Add hours to current date
Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
};

// Get day name of current date - example, sunday, monday etc
Date.prototype.dayName = function () {
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][this.getDay()];
};

// Start of current date - example 2019-09-01 12:34:32 -> 2019-09-01 00:00:00
Date.prototype.start = function () {
    let d = new Date(this);
    d.setUTCHours(0, 0, 0, 0);
    return d;
};

// End of current date - example 2019-09-01 12:34:32 -> 2019-09-01 23:59:59
Date.prototype.end = function () {
    let d = new Date(this);
    d.setUTCHours(23, 59, 59, 999);
    return d;
};

// Offset current date with days
Date.prototype.offset = function (offsetDay) {
    let today = new Date();
    today.setDate(today.getDate() + ~~offsetDay);
    return today;
};

// Offset current date with days
Date.prototype.secondsFromStartOfDay = function() {
    return (this.getTime() - this.start().getTime()) / 1000 | 0;
};

// Get current date without time
Date.prototype.date = function (isDMY) {
    if (isDMY) return ('0' + this.getDate()).slice(-2) + '.' + ('0' + (this.getMonth() + 1)).slice(-2) + '.' + this.getFullYear();
    return this.getFullYear() + '-' + ('0' + (this.getMonth() + 1)).slice(-2) + '-' + ('0' + this.getDate()).slice(-2);
};

// Get current time without date
Date.prototype.time = function (isShort) {
    if (isShort) return ('0' + this.getHours()).slice(-2) + ':' + ('0' + this.getMinutes()).slice(-2);
    return ('0' + this.getHours()).slice(-2) + ':' + ('0' + this.getMinutes()).slice(-2) + ':' + ('0' + this.getSeconds()).slice(-2);
};

// Convert current date object to ymd string
Date.prototype.toYMD = function () {
    let date = this;
    if (!date) return '0000-00-00';
    if (date === '0000-00-00') return '0000-00-00';
    let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
};

// Get number of week starts from current year
Date.prototype.getWeek = function () {
    let d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
    let dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
};

// Convert date object to string
Date.prototype.format = function () {
    return this.date() + ' ' + this.time();
};

// Convert date to human readable variant. Starts from current date, example: 5 sec before and etc
Date.prototype.humanDate = function () {
    let delta = Math.round((new Date() - this) / 1000);
    if (delta < 0) {
        return 'через ' + delta.intToHMS().humanTime();
    }
    if (delta < 86400) {
        return delta.intToHMS().humanTime() + ' назад';
    }

    if (this.date() === DateHelper.today(-2)) return 'Позавчера в ' + this.time(true);
    if (this.date() === DateHelper.today(-1)) return 'Вчера в ' + this.time(true);
    if (this.date() === DateHelper.today(0)) return 'Сегодня в ' + this.time(true);
    if (this.date() === DateHelper.today(1)) return 'Завтра в ' + this.time(true);
    if (this.date() === DateHelper.today(2)) return 'Послезавтра в ' + this.time(true);

    return this.format();
};

// Convert date to readable variant
Date.prototype.readableDate = function () {
    let month = ['Январь', 'Февраль', 'Апрель', 'Март', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    let day = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
    return day[this.getDay() - 1] + ' ' + ('0' + this.getDate()).slice(-2) + ' ' + month[this.getMonth()] + ' ' + this.getFullYear();
};

// Get current time with time zone offset
Date.prototype.getTimeWithTimezoneOffset = function () {
    return this.getTime() + (this.getTimezoneOffset() * 60000);
};

module.exports = DateHelper;