class VdeImage {
    public channel: any = {
        red: [],
        green: [],
        blue: [],
        gray: []
    };

    public isGrayScale: boolean = false;
    private readonly _width: number = 0;
    private readonly _height: number = 0;

    constructor({image = null, isGrayScale = false, width = 0, height = 0}) {
        this.isGrayScale = isGrayScale;

        if (image === null) {
            this._width = width;
            this._height = height;
            this.channel.red = new Array(width * height).fill(0);
            this.channel.green = new Array(width * height).fill(0);
            this.channel.blue = new Array(width * height).fill(0);
            this.channel.gray = new Array(width * height).fill(0);
        }

        if (image instanceof ImageData) {
            this._width = image.width;
            this._height = image.height;
            this.channel.red = new Array(image.width * image.height).fill(0);
            this.channel.green = new Array(image.width * image.height).fill(0);
            this.channel.blue = new Array(image.width * image.height).fill(0);
            this.channel.gray = new Array(image.width * image.height).fill(0);

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
        }

        if (isGrayScale) {
            this.channel.red = this.channel.gray;
            this.channel.green = this.channel.gray;
            this.channel.blue = this.channel.gray;
        }
    }

    draw(canvas: HTMLCanvasElement, isClear:boolean = false) {
        let ctx = canvas.getContext('2d');
        let imageData = ctx.createImageData(this.width, this.height);
        let imageIndex = 0;
        let px = 0, py = 0;

        for (let i = 0; i < imageData.width * imageData.height; i++) {
            let index = px % imageData.width + py % imageData.height * imageData.width;
            imageData.data[imageIndex++] = Math.floor(this.channel.red[index] * 255);
            imageData.data[imageIndex++] = Math.floor(this.channel.green[index] * 255);
            imageData.data[imageIndex++] = Math.floor(this.channel.blue[index] * 255);
            imageData.data[imageIndex++] = 255;

            px++;
            if (px >= imageData.width) {
                px = 0;
                py++;
            }
        }

        if (isClear) ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(imageData, 0, 0);
    }

    resize(width: number, height: number) {
        let newImage = new VdeImage({width, height, isGrayScale: this.isGrayScale});
        let px = 0, py = 0;

        let rw = this.width / width;
        let rh = this.height / height;
        let avgPixelW = ~~rw || 1;
        let avgPixelH = ~~rh || 1;

        for (let i = 0; i < width * height; i++) {
            let dstIndex = px % width + py % height * width;

            if (this.isGrayScale) newImage.channel.gray[dstIndex] = this.getAvgPixel(px * rw, py * rh, avgPixelW, avgPixelH, 'gray');
            else {
                newImage.channel.red[dstIndex] = this.getAvgPixel(px * rw, py * rh, avgPixelW, avgPixelH, 'red');
                newImage.channel.green[dstIndex] = this.getAvgPixel(px * rw, py * rh, avgPixelW, avgPixelH, 'green');
                newImage.channel.blue[dstIndex] = this.getAvgPixel(px * rw, py * rh, avgPixelW, avgPixelH, 'blue');
            }

            px += 1;
            if (px >= width) {
                px = 0;
                py += 1;
            }
        }

        return newImage;
    }

    convolution(core: Array<number>, width: number, height: number, stepX: number = 1, stepY: number = 1) {
        let outImage = new VdeImage({width: this.width / stepX | 0, height: this.height / stepY | 0, isGrayScale: this.isGrayScale});
        let px = 0, py = 0;

        for (let i = 0; i < this.width * this.height; i++) {
            let dstIndex = ~~(px / stepX) % outImage.width + ~~(py / stepY) % outImage.height * outImage.width;
            let final = 0;

            for (let x = 0; x < width; x++)
                for (let y = 0; y < height; y++)
                    final += core[x % width + y % height * width]
                        * this.getPixel(px + x - width / 2 | 0, py + y - height / 2 | 0, 'gray');

            outImage.channel.gray[dstIndex] = (1 + final) / 2;

            px += stepX;
            if (px > this.width) {
                px = 0;
                py += stepY;
            }

            if (py > this.height) break;
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
        for (let i = 0; i < width; i++)
            for (let j = 0; j < height; j++)
                value += this.getPixel(x + i - width / 2 | 0, y + j - height / 2 | 0, channel);

        return value / (width * height);
    }

    getMaxPixel(x: number, y: number, width: number, height: number, channel: string) {
        let value = [];
        for (let i = 0; i < width; i++)
            for (let j = 0; j < height; j++)
                value.push(this.getPixel(x + i - width / 2 | 0, y + j - height / 2 | 0, channel));

        return Math.max(...value);
    }

    pool(width: number = 2, height: number = 2, type: string = 'max') {
        let outImage = new VdeImage({width: this.width / width | 0, height: this.height / height | 0, isGrayScale: this.isGrayScale});
        let px = 0, py = 0;

        for (let i = 0; i < this.width * this.height; i++) {
            let dstIndex = ~~(px / width) % outImage.width + ~~(py / height) % outImage.height * outImage.width;

            if (type === 'max') outImage.channel.gray[dstIndex] = this.getMaxPixel(px, py, width, height, 'gray');
            if (type === 'avg') outImage.channel.gray[dstIndex] = this.getAvgPixel(px, py, width, height, 'gray');

            px += width;
            if (px > this.width) {
                px = 0;
                py += height;
            }

            if (py > this.height) break;
        }

        return outImage;
    }

    getPixel(x: number, y: number, channel: string) {
        return this.channel[channel][~~x % this._width + ~~y % this._height * this._width] || 0;
    }

    setPixel(x: number, y: number, value: number, channel: string) {
        this.channel[channel][~~x % this._width + ~~y % this._height * this._width] = value;
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }
}