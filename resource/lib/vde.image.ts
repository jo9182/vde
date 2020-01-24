class VdeImage {
    public channel: any = {
        red: null,
        green: null,
        blue: null,
        gray: null
    };

    public isGrayScale: boolean = false;
    private readonly _width: number = 0;
    private readonly _height: number = 0;

    constructor({image = null, isGrayScale = undefined, width = 0, height = 0}) {
        this.isGrayScale = !!isGrayScale;

        if (image === null) {
            this._width = width;
            this._height = height;
            this.channel.red = new Float32Array(width * height); // new Array(width * height).fill(0);
            this.channel.green = new Float32Array(width * height); // new Array(width * height).fill(0);
            this.channel.blue = new Float32Array(width * height); // new Array(width * height).fill(0);
            this.channel.gray = new Float32Array(width * height); // new Array(width * height).fill(0);
        } else if (image instanceof VdeImage) {
            this._width = image.width;
            this._height = image.height;
            this.channel.red = new Float32Array(image.channel.red); // [].concat(image.channel.red);
            this.channel.green = new Float32Array(image.channel.green); // [].concat(image.channel.green);
            this.channel.blue = new Float32Array(image.channel.blue); // [].concat(image.channel.blue);
            this.channel.gray = new Float32Array(image.channel.gray); // [].concat(image.channel.gray);
            this.isGrayScale = isGrayScale || image.isGrayScale;

            if (this.isGrayScale) {
                let length = this.channel.red.length;
                let r = image.channel.red;
                let g = image.channel.green;
                let b = image.channel.blue;
                let gray = this.channel.gray;
                for (let i = 0; i < length; i++)
                    gray[i] = (r[i] * 0.2126 + g[i] * 0.7152 + b[i] * 0.0722);
            }
        } else if (image instanceof ImageData) {
            this._width = image.width;
            this._height = image.height;
            this.channel.red = new Float32Array(image.width * image.height); // new Array(image.width * image.height).fill(0);
            this.channel.green = new Float32Array(image.width * image.height); // new Array(image.width * image.height).fill(0);
            this.channel.blue = new Float32Array(image.width * image.height); // new Array(image.width * image.height).fill(0);
            this.channel.gray = new Float32Array(image.width * image.height); // new Array(image.width * image.height).fill(0);

            let px = 0, py = 0;
            for (let i = 0; i < image.data.length; i += 4) {
                if (isGrayScale) {
                    this.channel.gray[px % image.width + py % image.height * image.width] = (image.data[i] * 0.2126 + image.data[i + 1] * 0.7152 + image.data[i + 2] * 0.0722) / 255;
                } else {
                    this.channel.red[px % image.width + py % image.height * image.width] = image.data[i] / 255;
                    this.channel.green[px % image.width + py % image.height * image.width] = image.data[i + 1] / 255;
                    this.channel.blue[px % image.width + py % image.height * image.width] = image.data[i + 2] / 255;
                }

                px++;
                if (px >= image.width) {
                    px = 0;
                    py++;
                }
            }
        } else if (typeof image === "object") {
            this._width = image._width;
            this._height = image._height;

            this.channel.red = new Float32Array(image.channel.red);
            this.channel.green = new Float32Array(image.channel.green);
            this.channel.blue = new Float32Array(image.channel.blue);
            this.channel.gray = new Float32Array(image.channel.gray);
            // this.channel = JSON.parse(JSON.stringify(image.channel));
        }

        if (isGrayScale) {
            this.channel.red = this.channel.gray;
            this.channel.green = this.channel.gray;
            this.channel.blue = this.channel.gray;
        }
    }

    draw(canvas: HTMLCanvasElement, isClear: boolean = false) {
        let ctx = canvas.getContext('2d');
        let imageData = ctx.createImageData(this.width, this.height);
        let imageIndex = 0;
        let px = 0, py = 0;
        let length = imageData.width * imageData.height;
        const r = this.channel.red, g = this.channel.green, b = this.channel.blue;
        const w = imageData.width, h = imageData.height;

        for (let i = 0; i < length; i++) {
            let index = px % w + py % h * w;
            imageData.data[imageIndex++] = (r[index] * 255) | 0;
            imageData.data[imageIndex++] = (g[index] * 255) | 0;
            imageData.data[imageIndex++] = (b[index] * 255) | 0;
            imageData.data[imageIndex++] = 255;

            px++;
            if (px >= w) {
                px = 0;
                py++;
            }
        }

        if (isClear) ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(imageData, 0, 0);
    }

    grayscale() {
        return new VdeImage({image: this, isGrayScale: true});
    }

    filter(fn: Function, channel: string = 'gray') {
        let copy = new VdeImage({image: this});

        for (let i = 0; i < copy.channel[channel].length; i++) {
            if (!fn(copy.channel[channel][i], i))
                copy.channel[channel][i] = 0;
            // console.log(copy.channel[channel][i]);
        }
        return copy;
    }

    map(fn: Function, channel: string = 'all', step: number = 1) {
        let copy = new VdeImage({image: this});

        if (channel === 'all') {
            for (let i = 0; i < copy.channel['red'].length; i++) {
                copy.channel['red'][i] = fn(copy.channel['red'][i]);
                copy.channel['green'][i] = fn(copy.channel['green'][i]);
                copy.channel['blue'][i] = fn(copy.channel['blue'][i]);
            }
        } else {
            if (step > 1) {
                for (let i = 0; i < this.width; i += step) {
                    for (let j = 0; j < this.height; j += step) {
                        let chunk = [];
                        let chunkPos = 0;

                        // Copy chunk
                        for (let ii = 0; ii < step; ii++) {
                            for (let jj = 0; jj < step; jj++) {
                                chunk.push(copy.getPixel(i + ii,j + jj, 'gray'));
                            }
                        }

                        // Paste chunk back
                        chunk = fn(chunk, step);
                        for (let ii = 0; ii < step; ii++) {
                            for (let jj = 0; jj < step; jj++) {
                                copy.setPixel(i + ii, j + jj, chunk[chunkPos++], 'gray');
                            }
                        }
                    }
                }
            } else {
                for (let i = 0; i < copy.channel[channel].length; i++)
                    copy.channel[channel][i] = fn(copy.channel[channel][i]);
            }
        }

        return copy;
    }

    resize(width: number, height: number) {
        let newImage = new VdeImage({width, height, isGrayScale: this.isGrayScale});
        let px = 0, py = 0;

        let rw = this.width / width;
        let rh = this.height / height;
        let avgPixelW = ~~rw || 1;
        let avgPixelH = ~~rh || 1;
        let length = width * height;
        let gray = newImage.channel.gray;
        let r = newImage.channel.red;
        let g = newImage.channel.green;
        let b = newImage.channel.blue;

        for (let i = 0; i < length; i++) {
            let dstIndex = px % width + py % height * width;

            if (this.isGrayScale) gray[dstIndex] = this.getAvgPixel(px * rw, py * rh, avgPixelW, avgPixelH, 'gray');
            else {
                r[dstIndex] = this.getAvgPixel(px * rw, py * rh, avgPixelW, avgPixelH, 'red');
                g[dstIndex] = this.getAvgPixel(px * rw, py * rh, avgPixelW, avgPixelH, 'green');
                b[dstIndex] = this.getAvgPixel(px * rw, py * rh, avgPixelW, avgPixelH, 'blue');
            }

            px += 1;
            if (px >= width) {
                px = 0;
                py += 1;
            }
        }

        return newImage;
    }

    scale(x: number = 1, y: number = 1) {
        return this.resize(~~(this.width * x), ~~(this.height * y));
    }

    convolution(core: Array<number>, width: number, height: number, stepX: number = 1, stepY: number = 1) {
        let outImage = new VdeImage({
            width: this.width / stepX | 0,
            height: this.height / stepY | 0,
            isGrayScale: this.isGrayScale
        });
        let px = 0, py = 0, length = this.width * this.height, w = outImage.width, h = outImage.height;
        let grayChannel = outImage.channel.gray;
        let thisGrayChannel = this.channel.gray;
        let thisW = this._width;
        let thisH = this._height;

        for (let i = 0; i < length; i++) {
            let dstIndex = ~~(px / stepX) % w + ~~(py / stepY) % h * w;
            let final = 0;

            for (let x = 0; x < width; x++) {
                for (let y = 0; y < height; y++) {
                    let fx = px + x - width / 2;
                    let fy = py + y - height / 2;

                    final += core[x % width + y % height * width] * thisGrayChannel[~~fx % thisW + ~~fy % thisH * thisW];
                }
            }

            grayChannel[dstIndex] = (1 + final) / 2;

            px += stepX;
            if (px > w) {
                px = 0;
                py += stepY;
            }

            if (py > h) break;
        }

        return outImage;
    }

    private _updateChannel(red: any = null, green: any = null, blue: any = null, gray: any = null) {
        if (red) this.channel.red = red;
        if (green) this.channel.green = green;
        if (blue) this.channel.blue = blue;
        if (gray) this.channel.gray = gray;
    }

    getAvgPixel(x: number, y: number, width: number, height: number, channel: string) {
        let value = 0;
        let ch = this.channel[channel];
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                let fx = x + i - width / 2 | 0;
                let fy = y + j - height / 2 | 0;
                value += ch[fx % this._width + fy % this._height * this._width];
            }
        }

        return value / (width * height);
    }

    getMaxPixel(x: number, y: number, width: number, height: number, channel: string) {
        let value = new Array(width * height);
        let ch = this.channel[channel];
        let pos = 0;
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                let fx = x + i - width / 2 | 0;
                let fy = y + j - height / 2 | 0;
                value[pos++] = ch[fx % this._width + fy % this._height * this._width];
            }
        }

        return Math.max(...value);
    }

    pool(width: number = 2, height: number = 2, type: string = 'max') {
        let outImage = new VdeImage({
            width: (this.width / width) | 0,
            height: (this.height / height) | 0,
            isGrayScale: this.isGrayScale
        });
        let px = 0, py = 0, length = this.width * this.height, w = outImage.width, h = outImage.height;
        let grayChannel = outImage.channel.gray;
        let thisWidth = this.width, thisHeight = this.height;

        for (let i = 0; i < length; i++) {
            let dstIndex = ~~(px / width) % w + ~~(py / height) % h * w;

            if (type === 'max') grayChannel[dstIndex] = this.getMaxPixel(px, py, width, height, 'gray');
            if (type === 'avg') grayChannel[dstIndex] = this.getAvgPixel(px, py, width, height, 'gray');

            px += width;
            if (px > thisWidth) {
                px = 0;
                py += height;
            }

            if (py > thisHeight) break;
        }

        return outImage;
    }

    getPixel(x: number, y: number, channel: string) {
        return this.channel[channel][~~x % this._width + ~~y % this._height * this._width] || 0;
    }

    setPixel(x: number, y: number, value: number, channel: string = 'all') {
        if (channel === 'all') {
            this.channel['red'][~~x % this._width + ~~y % this._height * this._width] = value;
            this.channel['green'][~~x % this._width + ~~y % this._height * this._width] = value;
            this.channel['blue'][~~x % this._width + ~~y % this._height * this._width] = value;
        } else {
            this.channel[channel][~~x % this._width + ~~y % this._height * this._width] = value;
        }
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    static benchmark() {
        console.time('VdeImage createImage');
        let img = new VdeImage({width: 1024, height: 1024});
        console.timeEnd('VdeImage createImage');

        console.time('VdeImage grayscale');
        let img2 = img.grayscale();
        console.timeEnd('VdeImage grayscale');

        console.time('VdeImage scale x0.5');
        img = img.scale(0.5, 0.5);
        console.timeEnd('VdeImage scale x0.5');

        console.time('VdeImage scale x2');
        img = img.scale(2, 2);
        console.timeEnd('VdeImage scale x2');

        img = img.grayscale();
        console.time('VdeImage gray scale x0.5');
        img = img.scale(0.5, 0.5);
        console.timeEnd('VdeImage gray scale x0.5');

        console.time('VdeImage gray scale x2');
        img = img.scale(2, 2);
        console.timeEnd('VdeImage gray scale x2');

        console.time('VdeImage convolution');
        img = img.convolution([-1, 0, 1, -2, 0, 2, -1, 0, 1], 3, 3, 1, 1);
        console.timeEnd('VdeImage convolution');

        console.time('VdeImage pool 2x2');
        img2 = img.pool(2, 2);
        console.timeEnd('VdeImage pool 2x2');
    }
}