module.exports = {
    resize(url, width, height) {
        return new Promise((resolve => {
            let canvas = document.createElement('canvas');
            let id = Math.random() + '';
            canvas.setAttribute("id", "tempCanvas_" + id);
            canvas.setAttribute("width", width);
            canvas.setAttribute("height", height);
            canvas.style.position = 'absolute';
            canvas.style.visibility = 'hidden';
            document.querySelector('body').appendChild(canvas);

            let ctx = canvas.getContext('2d');
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);
            ctx.imageSmoothingQuality = "high";
            let image = new Image();
            image.src = url;
            image.onload = () => {
                ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    document.querySelector('body').removeChild(canvas);
                    resolve(blob);
                }, 'image/jpeg');
            }
        }));
    },
    thumbnail(url, width, height) {
        return new Promise((resolve => {
            let canvas = document.createElement('canvas');
            let id = Math.random() + '';
            canvas.setAttribute("id", "tempCanvas_" + id);
            canvas.setAttribute("width", width);
            canvas.setAttribute("height", height);
            canvas.style.position = 'absolute';
            canvas.style.visibility = 'hidden';
            document.querySelector('body').appendChild(canvas);

            let ctx = canvas.getContext('2d');
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);
            ctx.imageSmoothingQuality = "high";
            let image = new Image();
            image.src = url;

            image.onload = () => {
                let size = image.width > image.height ?image.height :image.width;
                /*let newSize = width > height ?height :width;
                let ratio = 1;
                if (size / newSize > 4) ratio = 2;
                if (size / newSize > 6) ratio = 2.5;

                ctx.drawImage(image, 0, 0, size / ratio, size / ratio, 0, 0, width, height);*/

                ctx.drawImage(image, 0, 0, size, size, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    document.querySelector('body').removeChild(canvas);
                    resolve(blob);
                }, 'image/jpeg');
            }
        }));
    }
};