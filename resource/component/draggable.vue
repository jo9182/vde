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

            handler.addEventListener('mousedown', function (e) {
                startX = parent.x;
                startMouseX = e.pageX;
                startY = parent.y;
                startMouseY = e.pageY;
                isDrag = true;

                if (parent.startDrag) parent.startDrag();
            });

            document.addEventListener('mousemove', function (e) {
                // Resize area
                if (isGrab && parent.resizable) {
                    if (grabType === 'grab-rt') {
                        parent.width = startGrabWidth + (e.pageX - startGrabX);
                        parent.height = startGrabHeight + (startGrabY - e.pageY);
                        parent.y = startGrabPositionY - (parent.height - startGrabHeight);
                    }
                    if (grabType === 'grab-rb') {
                        parent.width = startGrabWidth + (e.pageX - startGrabX);
                        parent.height = startGrabHeight - (startGrabY - e.pageY);
                    }
                    if (grabType === 'grab-lt') {
                        parent.width = startGrabWidth - (e.pageX - startGrabX);
                        parent.height = startGrabHeight + (startGrabY - e.pageY);
                        parent.y = startGrabPositionY - (parent.height - startGrabHeight);
                        parent.x = startGrabPositionX - (parent.width - startGrabWidth);
                    }
                    if (grabType === 'grab-lb') {
                        parent.width = startGrabWidth - (e.pageX - startGrabX);
                        parent.height = startGrabHeight - (startGrabY - e.pageY);
                        parent.x = startGrabPositionX - (parent.width - startGrabWidth);
                    }

                    return;
                }

                if (isDrag) {
                    let offsetX = e.pageX - startMouseX;
                    let finalX = startX + offsetX;
                    if (finalX < 0) finalX = 0;
                    if (finalX > window.innerWidth - parent.width) finalX = window.innerWidth - parent.width;
                    parent.x = finalX;
                    let offsetY = e.pageY - startMouseY;
                    let finalY = startY + offsetY;
                    if (finalY < 0) finalY = 0;
                    if (finalY > window.innerHeight - parent.height) finalY = window.innerHeight - parent.height;
                    parent.y = finalY;
                }
            });

            document.addEventListener('mouseup', function (e) {
                isDrag = false;
                isGrab = false;

                if (parent.stopDrag) parent.stopDrag();
            });

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