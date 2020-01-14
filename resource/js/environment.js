import DataStorage from "./data.storage";

let Environment = {
    init() {
        // Set resolution change event
        let onScreenResize = () => {
            DataStorage.screen.width = window.innerWidth;
            DataStorage.screen.height = window.innerHeight;

            DataStorage.screen.iconWidth = '20%';
            DataStorage.screen.iconHeight = '200px';

            // Mobile L
            if (DataStorage.screen.width <= 768) {
                DataStorage.screen.iconWidth = '20%';
                DataStorage.screen.iconHeight = '140px';
            }

            // Mobile L
            if (DataStorage.screen.width <= 425) {
                DataStorage.screen.iconWidth = '25%';
                DataStorage.screen.iconHeight = '140px';
            }

            // Mobile Small
            if (DataStorage.screen.width <= 320) {
                DataStorage.screen.iconWidth = '25%';
                DataStorage.screen.iconHeight = '120px';
            }
        };
        window.onresize = onScreenResize;
        onScreenResize();

        let isTouchEnd = false;
        let desktopX = false;
        let animate = () => {
            DataStorage.desktop.x += ((-DataStorage.desktop.id * window.innerWidth + -desktopX) - DataStorage.desktop.x) / 12;
            window.requestAnimationFrame(animate);
        };
        window.requestAnimationFrame(animate);

        let startFromX = 0;
        let isMouseDown = false;
        document.addEventListener('mousedown', function (event) {
            startFromX = event.screenX;
            isTouchEnd = false;
            isMouseDown = true;
        });

        document.addEventListener('mousemove', function (event) {
            if (!isMouseDown) return;
            event = event.originalEvent || event;
            event.preventDefault();

            if (!DataStorage.event.isDrag) desktopX = -event.screenX + startFromX;
        }, {passive: false});

        document.addEventListener('mouseup', function (event) {
            if (desktopX > 100) {
                DataStorage.desktop.id++;
                if (DataStorage.desktop.id > DataStorage.desktop.maxId)
                    DataStorage.desktop.id = DataStorage.desktop.maxId;
            }
            if (desktopX < -100) {
                DataStorage.desktop.id--;
                if (DataStorage.desktop.id <= 0)
                    DataStorage.desktop.id = 0;
            }
            desktopX = 0;
            isMouseDown = false;
        });

        // Click
        document.addEventListener('mousedown', function (event) {
            DataStorage.input.x = event.pageX;
            DataStorage.input.y = event.pageY;
        }, {passive: false});

        document.addEventListener('click', function (event) {
            DataStorage.desktop.isRemoveMode = false;
        }, {passive: false});
    }
};

export default Environment;