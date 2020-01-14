class VdeImage {
    public channel: any = {
        red: [],
        green: [],
        blue: [],
        gray: []
    };

    public isGrayScale: boolean = false;
    private _width: number = 0;
    private _height: number = 0;

    constructor({ image = null, isGrayScale = false, width = 0, height = 0 }) {
        this.isGrayScale = isGrayScale;

        if (image === null) {
            this._width = width;
            this._height = height;
            this.channel.red.length = width * height;
            this.channel.green.length = width * height;
            this.channel.blue.length = width * height;
            this.channel.gray.length = width * height;
        }

        if (image instanceof ImageData) {
            this._width = image.width;
            this._height = image.height;
            this.channel.red.length = image.width * image.height;
            this.channel.green.length = image.width * image.height;
            this.channel.blue.length = image.width * image.height;

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
                if (px > image.width) {
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

    draw(canvas: HTMLCanvasElement) {
        let ctx = canvas.getContext('2d');
        let imageData = ctx.createImageData(this.width, this.height);
        let imageIndex = 0;
        let px = 0, py = 0;

        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                let index = px % imageData.width + py % imageData.height * imageData.width;
                imageData.data[imageIndex++] = this.channel.red[index] * 255;
                imageData.data[imageIndex++] = this.channel.green[index] * 255;
                imageData.data[imageIndex++] = this.channel.blue[index] * 255;
                imageData.data[imageIndex++] = 255;

                px++;
                if (px > this.width) {
                    px = 0;
                    py++;
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    resize(width: number, height: number) {
        let tempRedChannel = new Array(width * height);
        let tempGreenChannel = new Array(width * height);
        let tempBlueChannel = new Array(width * height);
        let tempGrayChannel = new Array(width * height);
        let px = 0, py = 0;
        let rw = this.width / width;
        let rh = this.height / height;

        for (let i = 0; i < this.width * this.height; i++) {
            let srcIndex = px % this.width + py % this.height * this.width;
            let dstIndex = ~~(px / rw) % ~~(this.width / rw) + ~~(py / rh) % ~~(this.height / rh) * ~~(this.width / rw);

            if (this.isGrayScale) {
                tempGrayChannel[dstIndex] = this.channel.gray[srcIndex];
            } else {
                tempRedChannel[dstIndex] = this.channel.red[srcIndex];
                tempGreenChannel[dstIndex] = this.channel.green[srcIndex];
                tempBlueChannel[dstIndex] = this.channel.blue[srcIndex];
            }

            px++;
            if (px > this.width) {
                px = 0;
                py++;
            }
        }

        this._width = width;
        this._height = height;

        if (this.isGrayScale) {
            this._updateChannel(tempGrayChannel, tempGrayChannel, tempGrayChannel, tempGrayChannel);
        } else {
            this._updateChannel(tempRedChannel, tempGreenChannel, tempBlueChannel, null);
        }
    }

    convolution(core: Array<number>, width: number, height: number) {
        let outImage = new VdeImage({ width: this.width, height: this.height, isGrayScale: this.isGrayScale });
        let px = 1, py = 1;

        for (let i = 0; i < this.width * this.height; i++) {
            let srcIndex = px % this.width + py % this.height * this.width;
            let final = 0;

            for (let x = 0; x < width; x++) {
                for (let y = 0; y < height; y++) {
                    final += this.channel.gray[(px - 1) % this.width + (py - 1) % this.height * this.width] * core[x % width + y % height * width];
                }
            }
            outImage.channel.gray[srcIndex] = final;

            px++;
            if (px > this.width) {
                px = 0;
                py++;
            }
        }

        return outImage;
    }

    private _updateChannel(red: any = null, green: any = null, blue: any = null, gray: any = null) {
        if (red) this.channel.red = red;
        if (green) this.channel.green = green;
        if (blue) this.channel.blue = blue;
        if (gray) this.channel.gray = gray;
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }
}