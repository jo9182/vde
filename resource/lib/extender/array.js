// Get average value from array
Array.prototype.avg = function (field) {
    let out = 0;
    for (let i = 0; i < this.length; i++) {
        if (field) out += this[i][field] * 1;
        else out += this[i];
    }
    return out / this.length;
};

// Calculate sum of array elements
Array.prototype.sum = function (field) {
    let out = 0;
    for (let i = 0; i < this.length; i++) {
        if (field) out += this[i][field] * 1;
        else out += this[i];
    }
    return out;
};

// [a, b, c] -> [b - a, c - b]
Array.prototype.gap = function () {
    let out = [];
    for (let i = 0; i < this.length - 1; i++) {
        let a = this[i];
        let b = this[i + 1];
        out.push(b - a);
    }
    return out;
};

// [{a:1, b:2},{a:1, b:2},{a:1, b:2}] extract a -> [1, 1, 1]
Array.prototype.extractField = function (field) {
    let out = [];
    for (let i = 0; i < this.length; i++) {
        out.push(this[i][field]);
    }
    return out;
};

// Remove specific value from array
Array.prototype.clean = function (deleteValue) {
    for (let i = 0; i < this.length; i++) {
        if (this[i] === deleteValue) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};

// Sort array by specific field
Array.prototype.sortBy = function (field, isReverse) {
    this.sort(function (a, b) {
        if (isReverse) return (a[field] > b[field]) ? -1 : ((b[field] > a[field]) ? 1 : 0);
        return (a[field] > b[field]) ? 1 : ((b[field] > a[field]) ? -1 : 0);
    });
    return this;
};

// Cut off array if it more than specified length
Array.prototype.limit = function (value) {
    if (this.length > value) this.length = value;
    return this;
};

// Clone array
Array.prototype.clone = function (value) {
    return [].concat(this);
};

// Remove non unique values from array
Array.prototype.unique = function (field) {
    if (field) {
        let out = [];
        for (let i = 0; i < this.length; i++) {
            let isExist = false;
            for (let j = 0; j < out.length; j++) {
                if (out[j][field] === this[i][field]) {
                    isExist = true;
                    break;
                }
            }
            if (!isExist)
                out.push(this[i]);
        }
        return out;
    }
    return this.filter(function (value, index, self) {
        return self.indexOf(value) === index;
    });
};