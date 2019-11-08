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
            let image = new Image();
            image.src = url;
            image.onload = () => {
                ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    document.querySelector('body').removeChild(canvas);
                    resolve(blob);
                }, 'image/jpeg')
            }
        }));
    }
};