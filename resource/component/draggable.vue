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
            source: Object,
            start: Object,
            resizable: Boolean,
            startDrag: Function,
            stopDrag: Function,
            resize: Function,
            disabled: Boolean
        },
        computed: {
            style() {
                if (this.disabled) {
                    return {
                        left: '0px',
                        top: '0px',
                        width: '100%',
                        height: '100%'
                    }
                }
                if (this.sourceArea) {
                    return {
                        left: this.sourceArea.x + 'px',
                        top: this.sourceArea.y + 'px',
                        width: this.sourceArea.width + 'px',
                        height: this.sourceArea.height + 'px',
                        zIndex: this.sourceArea.zIndex,
                        opacity: this.opacity,
                        transform: this.transform
                    }
                }
                if (this.width) {
                    return {
                        left: this.x + 'px',
                        top: this.y + 'px',
                        width: this.width + 'px',
                        height: this.height + 'px',
                        transform: this.transform
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
            let skewXTemp = 0;
            let skewYTemp = 0;
            let tempArea = this.tempArea;

            let animate = () => {
                if (Math.abs(skewXTemp) < 0.1) skewXTemp = 0;
                else skewXTemp += (0 - skewXTemp) / 8;

                if (Math.abs(skewYTemp) < 0.1) skewYTemp = 0;
                else skewYTemp += (0 - skewYTemp) / 8;

                this.sourceArea.x += (tempArea.x - this.sourceArea.x) / 8;
                this.sourceArea.y += (tempArea.y - this.sourceArea.y) / 8;
                this.sourceArea.width += (tempArea.width - this.sourceArea.width) / 8;
                this.sourceArea.height += (tempArea.height - this.sourceArea.height) / 8;

                this.opacity += (this.tempOpacity - this.opacity) / 8;
                this.transform = `skewX(${skewXTemp}deg) rotateX(${skewYTemp}deg)`;
                window.requestAnimationFrame(animate);
            };
            window.requestAnimationFrame(animate);

            let parent = this;
            let area = this;

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
            if (this.source) area = this.source;

            let mousedown = function (e) {
                if (parent.disabled) return;
                let touches = e.changedTouches;
                let pageX = touches ?touches[0].pageX :e.pageX;
                let pageY = touches ?touches[0].pageY :e.pageY;

                startX = tempArea.x;
                startMouseX = pageX;
                startY = tempArea.y;
                startMouseY = pageY;
                isDrag = true;

                if (parent.startDrag) parent.startDrag();
            };

            let mousemove = function (e) {
                if (parent.disabled) return;
                let touches = e.changedTouches;
                let pageX = touches ?touches[0].pageX :e.pageX;
                let pageY = touches ?touches[0].pageY :e.pageY;

                // Resize area
                if (isGrab && parent.resizable) {
                    if (grabType === 'grab-rt') {
                        area.width = startGrabWidth + (pageX - startGrabX);
                        tempArea.height = startGrabHeight + (startGrabY - pageY);
                        tempArea.y = startGrabPositionY - (tempArea.height - startGrabHeight);
                    }
                    if (grabType === 'grab-rb') {
                        tempArea.width = startGrabWidth + (pageX - startGrabX);
                        tempArea.height = startGrabHeight - (startGrabY - pageY);
                    }
                    if (grabType === 'grab-lt') {
                        tempArea.width = startGrabWidth - (pageX - startGrabX);
                        tempArea.height = startGrabHeight + (startGrabY - pageY);
                        tempArea.y = startGrabPositionY - (tempArea.height - startGrabHeight);
                        tempArea.x = startGrabPositionX - (tempArea.width - startGrabWidth);
                    }
                    if (grabType === 'grab-lb') {
                        tempArea.width = startGrabWidth - (pageX - startGrabX);
                        tempArea.height = startGrabHeight - (startGrabY - pageY);
                        tempArea.x = startGrabPositionX - (tempArea.width - startGrabWidth);
                    }

                    if (parent.resize)
                        parent.resize();

                    return;
                }

                if (isDrag) {
                    let offsetX = pageX - startMouseX;
                    let finalX = startX + offsetX;
                    if (finalX < 0) finalX = 0;
                    if (finalX > window.innerWidth - tempArea.width) finalX = window.innerWidth - tempArea.width;
                    skewXTemp += -(finalX - tempArea.x) / 10;
                    tempArea.x = finalX;
                    let offsetY = pageY - startMouseY;
                    let finalY = startY + offsetY;
                    if (finalY < 26) finalY = 26;
                    if (finalY > window.innerHeight - tempArea.height) finalY = window.innerHeight - tempArea.height;
                    skewYTemp += -(finalY - tempArea.y) / 4;
                    tempArea.y = finalY;
                }
            };
            let mouseup = function (e) {
                if (parent.disabled) return;
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
                let onGrab = function (e) {
                    grabType = this.getAttribute('class').replace('grab ', '');

                    isGrab = true;
                    isDrag = false;
                    startGrabWidth = tempArea.width;
                    startGrabX = e.changedTouches? e.changedTouches[0].pageX :e.pageX;
                    startGrabHeight = tempArea.height;
                    startGrabY = e.changedTouches? e.changedTouches[0].pageY :e.pageY;
                    startGrabPositionY = tempArea.y;
                    startGrabPositionX = tempArea.x;
                    if (parent.startDrag) parent.startDrag();
                };

                let ss = Array.from(this.$refs.dragArea.querySelectorAll('.grab'));
                for (let i = 0; i < ss.length; i++) {
                    ss[i].addEventListener('mousedown', onGrab);
                    ss[i].addEventListener('touchstart', onGrab);
                }
            }

            // Set source values
            if (this.source) {
                this.sourceArea = this.source;
                tempArea.x = this.sourceArea.x;
                tempArea.y = this.sourceArea.y;
                tempArea.width = this.sourceArea.width;
                tempArea.height = this.sourceArea.height;
            } else {
                if (this.start) {
                    this.width = this.start.width || this.$refs.dragArea.getBoundingClientRect().width;
                    this.height = this.start.height || this.$refs.dragArea.getBoundingClientRect().height;
                    this.x = this.start.x || 0;
                    this.y = this.start.y || 0;
                } else {
                    this.width = this.$refs.dragArea.getBoundingClientRect().width;
                    this.height = this.$refs.dragArea.getBoundingClientRect().height;
                }
            }
        },
        methods: {
            setSize(width, height) {
                this.tempArea.width = width;
                this.tempArea.height = height;
            },
            close() {
                this.tempArea.y -= 100;
                this.tempOpacity = 0;
            }
        },
        data() {
            return {
                sourceArea: null,
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                skewX: 0,
                transform: '',
                opacity: 1,
                tempOpacity: 1,
                tempArea: { x: 0, y: 0, width: 0, height: 0 },

                timerId: 0
            }
        },
    }
</script>

<style lang="scss" scoped>
    .draggable-container {
        position: absolute;
        // transition: width, 0.3s;

        .grab {
            position: absolute;
            width: 12px;
            height: 12px;
            border-radius: 6px;
            background: #ffffff;
            user-select: none;
            opacity: 0;
            transition: opacity 0.2s;

            &:hover {
                opacity: 0.8;
            }
        }

        .grab-lt {
            top: -12px;
            left: -12px;
            cursor: se-resize;
        }

        .grab-rt {
            top: -12px;
            right: -12px;
            cursor: sw-resize;
        }

        .grab-lb {
            bottom: -12px;
            left: -12px;
            cursor: ne-resize;
        }

        .grab-rb {
            bottom: -12px;
            right: -12px;
            cursor: nw-resize;
        }
    }
</style>