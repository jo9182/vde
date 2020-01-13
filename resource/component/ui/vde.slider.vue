<template>
    <div class="vde-slider-container">
        <div ref="slider" class="vde-slider" draggable="false">
            <div class="knob" ref="knob" :style="position" draggable="false">{{ progress.toFixed(1) }}</div>
        </div>
        <div class="bar-list" draggable="false">
            <div class="bar" v-for="x in 8" :style="x === 8 ?{ borderRight: '1px solid #4b4b4b' }: {}"
                 draggable="false"></div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "vde-slider",
        props: {},
        mounted() {
            let startX = 0;
            let offsetX = 0;
            let isDrag = false;
            let lastProgress = 0;
            this.$refs['knob'].addEventListener('mousedown', (e) => {
                startX = e.pageX;
                isDrag = true;
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDrag) return;
                this.progress = (e.pageX - startX) / (this.$refs['slider'].getBoundingClientRect().width - 16) + lastProgress;
                if (this.progress < 0) this.progress = 0;
                if (this.progress > 1) this.progress = 1;

                this.position.left = this.progress * (this.$refs['slider'].getBoundingClientRect().width - 16) + 'px';
            });

            document.addEventListener('mouseup', (e) => {
                lastProgress = this.progress;
                isDrag = false;
            });
        },
        beforeDestroy() {

        },
        methods: {},
        data() {
            return {
                progress: 0,
                currentValue: 0,
                position: {
                    left: '0px'
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    .vde-slider-container {
        .vde-slider {
            background: #4b4b4b;
            position: relative;
            height: 4px;
            margin-top: 4px;
            user-select: none;
            box-shadow: 0 1px 1px 0 #0a0a0a;

            .knob {
                top: -4px;
                position: absolute;
                width: 16px;
                height: 12px;
                border-radius: 4px;
                background: #bbbbbb;
                cursor: pointer;
                font-size: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                line-height: 12px;
                color: #121212;
                box-shadow: 0 1px 1px 0 #0a0a0a;
            }
        }

        .bar-list {
            display: flex;
            margin-top: 5px;

            .bar {
                border-left: 1px solid #4b4b4b;
                flex: 1;
                height: 4px;
            }
        }
    }

</style>