<template>
    <div ref="dragArea" class="draggable-container" :style="style">
        <slot ref="slotElement"></slot>

        <div v-if="resizable" class="grab grab-lt"></div>
        <div v-if="resizable" class="grab grab-rt"></div>
        <div v-if="resizable" class="grab grab-lb"></div>
        <div v-if="resizable" class="grab grab-rb"></div>
    </div>
</template>

<script>
    export default {
        name: "draggable",
        props: {
            start: Object,
            resizable: Boolean,
            startDrag: Function,
            stopDrag: Function,
        },
        computed: {
            style() {
                if (this.width) {
                    return {
                        left: this.x + 'px',
                        top: this.y + 'px',
                        width: this.width + 'px',
                        height: this.height + 'px'
                    }
                }
                return {
                    left: this.x + 'px',
                    top: this.y + 'px'
                }
            }
        },
        beforeDestroy() {

        },
        mounted() {
            let parent = this;

            // Drag
            let startX = 0;
            let startMouseX = 0;
            let startY = 0;
            let startMouseY = 0;
            let isDrag = false;

            // Grab
            let isGrab = false;
            let startGrabX = 0;
            let startGrabPositionX = 0;
            let startGrabWidth = 0;
            let startGrabY = 0;
            let startGrabPositionY = 0;
            let startGrabHeight = 0;
            let grabType = '';

            let handler = this.$refs.dragArea.querySelector('[data-draggable]');
            if (!handler) handler = this.$refs.dragArea;

            let mousedown = function (e) {
                let touches = e.changedTouches;
                let pageX = touches ?touches[0].pageX :e.pageX;
                let pageY = touches ?touches[0].pageY :e.pageY;

                startX = parent.x;
                startMouseX = pageX;
                startY = parent.y;
                startMouseY = pageY;
                isDrag = true;

                if (parent.startDrag) parent.startDrag();
            };

            let mousemove = function (e) {
                let touches = e.changedTouches;
                let pageX = touches ?touches[0].pageX :e.pageX;
                let pageY = touches ?touches[0].pageY :e.pageY;

                // Resize area
                if (isGrab && parent.resizable) {
                    if (grabType === 'grab-rt') {
                        parent.width = startGrabWidth + (pageX - startGrabX);
                        parent.height = startGrabHeight + (startGrabY - pageY);
                        parent.y = startGrabPositionY - (parent.height - startGrabHeight);
                    }
                    if (grabType === 'grab-rb') {
                        parent.width = startGrabWidth + (pageX - startGrabX);
                        parent.height = startGrabHeight - (startGrabY - pageY);
                    }
                    if (grabType === 'grab-lt') {
                        parent.width = startGrabWidth - (pageX - startGrabX);
                        parent.height = startGrabHeight + (startGrabY - pageY);
                        parent.y = startGrabPositionY - (parent.height - startGrabHeight);
                        parent.x = startGrabPositionX - (parent.width - startGrabWidth);
                    }
                    if (grabType === 'grab-lb') {
                        parent.width = startGrabWidth - (pageX - startGrabX);
                        parent.height = startGrabHeight - (startGrabY - pageY);
                        parent.x = startGrabPositionX - (parent.width - startGrabWidth);
                    }

                    return;
                }

                if (isDrag) {
                    let offsetX = pageX - startMouseX;
                    let finalX = startX + offsetX;
                    if (finalX < 0) finalX = 0;
                    if (finalX > window.innerWidth - parent.width) finalX = window.innerWidth - parent.width;
                    parent.x = finalX;
                    let offsetY = pageY - startMouseY;
                    let finalY = startY + offsetY;
                    if (finalY < 0) finalY = 0;
                    if (finalY > window.innerHeight - parent.height) finalY = window.innerHeight - parent.height;
                    parent.y = finalY;
                }
            };
            let mouseup = function (e) {
                isDrag = false;
                isGrab = false;

                if (parent.stopDrag) parent.stopDrag();
            };

            // Drag start
            handler.addEventListener('mousedown', mousedown);
            handler.addEventListener('touchstart', mousedown);

            // Mouse move
            document.addEventListener('mousemove', mousemove);
            document.addEventListener('touchmove', mousemove);

            // Mouse up
            document.addEventListener('mouseup', mouseup);
            document.addEventListener('touchend', mouseup);

            // Resize logic
            if (this.resizable) {
                let ss = Array.from(this.$refs.dragArea.querySelectorAll('.grab'));
                for (let i = 0; i < ss.length; i++) {
                    ss[i].addEventListener('mousedown', function (e) {
                        grabType = this.getAttribute('class').replace('grab ', '');

                        isGrab = true;
                        isDrag = false;
                        startGrabWidth = parent.width;
                        startGrabX = e.pageX;
                        startGrabHeight = parent.height;
                        startGrabY = e.pageY;
                        startGrabPositionY = parent.y;
                        startGrabPositionX = parent.x;
                    });
                }
            }

            if (this.start) {
                this.width = this.start.width || this.$refs.dragArea.getBoundingClientRect().width;
                this.height = this.start.height || this.$refs.dragArea.getBoundingClientRect().height;
                this.x = this.start.x || 0;
                this.y = this.start.y || 0;
            } else {
                this.width = this.$refs.dragArea.getBoundingClientRect().width;
                this.height = this.$refs.dragArea.getBoundingClientRect().height;
            }
        },
        methods: {

        },
        data() {
            return {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            }
        },
    }
</script>

<style lang="scss" scoped>
    .draggable-container {
        position: absolute;

        .grab {
            position: absolute;
            width: 8px;
            height: 8px;
            border-radius: 4px;
            background: #ffffff;
            user-select: none;
            opacity: 0;
            transition: opacity 0.2s;

            &:hover {
                opacity: 0.8;
            }
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