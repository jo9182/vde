<template>
    <vde-panel ref='chart' :title="title" class="vde-chart">
        <div v-if="isShowHint" class="hint" :style="hintPosition">{{ hintValue }}</div>
        <svg v-if="!type || type === 'line'">
            <line v-for="x in lines" :x1="x[0]" :y1="x[1]" :x2="x[2]" :y2="x[3]" stroke="#bbbbbb"
                  stroke-width="2"></line>
        </svg>

        <svg v-if="type === 'bar'">
            <rect @mousemove="show(x[4], $event)" @mouseout="hide()" v-for="x in lines" :x="x[0]" :y="x[1]" :width="x[2]" :height="x[3]"
                  stroke="#4b4b4b" stroke-width="2"
                  fill="#bbbbbb"></rect>
        </svg>

        <div class="legend">
            <div v-for="x in legend">{{ x.humanReadableSize(1, 1000) }}</div>
        </div>
    </vde-panel>
</template>

<script>
    export default {
        name: "vde-chart",
        props: {
            title: String,
            type: String,
            data: Array,
            max: Number
        },
        mounted() {
            this.calculate();
        },
        beforeDestroy() {

        },
        methods: {
            hide() {
                this.isShowHint = false;
            },
            show(x, e) {
                this.hintValue = x.toFixed(2);
                this.isShowHint = true;
                this.hintPosition.left = (e.pageX - this.$refs['chart'].$el.getBoundingClientRect().left + 16) + 'px';
                this.hintPosition.top = (e.pageY - this.$refs['chart'].$el.getBoundingClientRect().top + 16) + 'px';
            },
            calculate() {
                let max = this.max || Math.max(...this.data);
                let len = this.data.length - 1;
                this.lines.length = 0;

                for (let i = 0; i < len; i++) {
                    if (this.type === 'bar') {
                        let yPos = 100 - ((this.data[i] / max) * 100);
                        this.lines.push([
                            i / len * 100 + '%',
                            yPos + '%',
                            (1 / len * 100) + '%',
                            (this.data[i] / max) * 100 + '%',
                            this.data[i]
                        ]);
                    } else {
                        this.lines.push([
                            i / len * 100 + '%',
                            (1 - this.data[i] / max) * 100 + '%',
                            (i + 1) / len * 100 + '%',
                            (1 - this.data[i + 1] / max) * 100 + '%',
                            this.data[i]
                        ]);
                    }
                }

                let step = max / 4;
                this.legend = new Array(5).fill(0).map((x, i) => (4 - i) * step);
            }
        },
        watch: {
            data(val) {
                this.calculate();
            }
        },
        data() {
            return {
                lines: [],
                legend: [],
                isShowHint: false,
                hintPosition: {
                    left: '-10px',
                    top: '-27px'
                },
                hintValue: 0
            }
        }
    }
</script>

<style lang="scss" scoped>
    .vde-chart {
        svg {
            background: #4b4b4b;
            display: block;
            width: 100%;
            height: 100%;
            margin-left: 25px;

            line, rect {
                transition: 0.35s;

                &:hover {
                    opacity: 0.8;
                }
            }
        }

        .hint {
            position: absolute;
            top: -27px;
            left: 240px;
            background: #fefefe;
            width: 100px;
            height: 24px;
            z-index: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
        }

        .legend {
            display: flex;
            flex-direction: column;
            position: absolute;
            left: 2px;
            font-size: 10px;
            height: calc(100% - 20px);
            width: 32px;

            > div {
                display: flex;
                flex: 1;
                align-items: flex-end;
                justify-content: center;
            }
        }
    }
</style>