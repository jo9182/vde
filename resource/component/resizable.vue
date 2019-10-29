<template>
    <div ref="resizeArea" class="resizable-container" :style="style">
        <slot></slot>
        <div class="grab grab-lt"></div>
        <div class="grab grab-rt"></div>
        <div class="grab grab-lb"></div>
        <div class="grab grab-rb"></div>
    </div>
</template>

<script>
    export default {
        name: "resizable",
        props: {
            area: Object
        },
        computed: {
            style() {
                return {
                    left: this.area.x + 'px',
                    top: this.area.y + 'px',
                    width: this.area.width + 'px',
                    height: this.area.height + 'px',
                    zIndex: this.area.zIndex
                }
            }
        },
        beforeDestroy() {
            document.removeEventListener('mouseup', this.mouseUpEvent);
            document.removeEventListener('mousemove', this.mouseMoveEvent);
        },
        mounted() {
            // Drag logic
            let resizeArea = this.$refs.resizeArea;
            let area = this.area;
            let isDrag = false;
            let startX = 0;
            let startMouseX = 0;
            let startY = 0;
            let startMouseY = 0;
            let isGrab = false;
            let startGrabX = 0;
            let startGrabWidth = 0;
            let startGrabY = 0;
            let startGrabHeight = 0;
            let parent = this;

            window.dragged = null;

            this.$refs.resizeArea.querySelector('.caption').addEventListener('mousedown', function (e) {
                window.dragged = resizeArea;

                startX = area.x;
                startMouseX = e.pageX;
                startY = area.y;
                startMouseY = e.pageY;
                isDrag = true;

                parent.$emit('startDrag', 1);
            });

            this.mouseUpEvent = function () {
                window.dragged = null;
                window.grab = null;
                isDrag = false;
                isGrab = false;
            };
            this.mouseMoveEvent = function (e) {
                if (isDrag && window.dragged === resizeArea) {
                    let offsetX = e.pageX - startMouseX;
                    let finalX = startX + offsetX;
                    if (finalX < 0) finalX = 0;
                    area.x = finalX;
                    let offsetY = e.pageY - startMouseY;
                    let finalY = startY + offsetY;
                    if (finalY < 0) finalY = 0;
                    area.y = finalY;
                    area.isDraggable = true;

                } else area.isDraggable = false;

                if (isGrab) {
                    area.width = startGrabWidth + (e.pageX - startGrabX);
                    area.height = startGrabHeight + (startGrabY - e.pageY);
                    area.y = startGrabY - (area.height - startGrabHeight);
                }
            };

            document.addEventListener('mouseup', this.mouseUpEvent);
            document.addEventListener('mousemove', this.mouseMoveEvent);

            // Resize logic
            this.$refs.resizeArea.querySelector('.grab-rt').addEventListener('mousedown', function (e) {
                isGrab = true;
                startGrabWidth = area.width;
                startGrabX = e.pageX;
                startGrabHeight = area.height;
                startGrabY = e.pageY;
            });
        },
        methods: {},
        data() {
            return {
                mouseUpEvent: null,
                mouseMoveEvent: null
            }
        },
    }
</script>

<style lang="scss" scoped>
    .resizable-container {
        // border: 1px solid #ff0000;
        position: absolute;
        z-index: 0;

        .grab {
            position: absolute;
            width: 8px;
            height: 8px;
            background: #f00;
            opacity: 0;
            user-select: none;
        }

        .grab-lt {
            top: -8px;
            left: -8px;
            cursor: se-resize;
        }

        .grab-rt {
            top: -8px;
            right: -8px;
            cursor: sw-resize;
        }

        .grab-lb {
            bottom: -8px;
            left: -8px;
            cursor: ne-resize;
        }

        .grab-rb {
            bottom: -8px;
            right: -8px;
            cursor: nw-resize;
        }
    }
</style>