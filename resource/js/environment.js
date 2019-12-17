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

        // Prevent zoom on iOS
        document.addEventListener('touchmove', function (event) {
            event = event.originalEvent || event;
            event.preventDefault();
        }, {passive: false});

        // Click
        document.addEventListener('mousedown', function (event) {
            DataStorage.input.x = event.pageX;
            DataStorage.input.y = event.pageY;
        }, {passive: false});
    }
};

export default Environment;