<template>
    <div class="number-range">
        <div @click="prev" class="left-button">-</div>
        <div><input type="text" v-model="currentValue"></div>
        <div @click="next" class="right-button">+</div>
    </div>
</template>

<script>
    export default {
        name: "vde-number-range",
        props: {
            value: Number,
            step: Number,
            max: Number,
            min: Number,
        },
        mounted() {
            this.currentValue = this.value || 0;
            this.currentStep = this.step || 0.1;
            this.currentMax = this.max || 1;
            this.currentMin = this.min || 0;
        },
        methods: {
            prev() {
                this.currentValue = this.currentValue * 1 - this.currentStep;
                this.constrain();
                this.$emit('change', this.currentValue);
            },
            next() {
                this.currentValue = this.currentValue * 1 + this.currentStep;
                this.constrain();
                this.$emit('change', this.currentValue);
            },
            constrain() {
                if (this.currentValue < this.currentMin) this.currentValue = this.currentMin * 1;
                if (this.currentValue > this.currentMax) this.currentValue = this.currentMax * 1;
                this.currentValue = this.currentValue.toFixed(2) * 1;
            }
        },
        data() {
            return {
                currentMin: 0,
                currentMax: 1,
                currentStep: 0.1,
                currentValue: 0
            }
        }
    }
</script>

<style lang="scss" scoped>
    .number-range {
        display: flex;
        align-items: center;

        input {
            width: 64px;
            text-align: center;
            background: none;
            border: 0;
        }

        .left-button, .right-button {
            cursor: pointer;
            width: 24px;
            height: 24px;
            background: #0cddff;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fefefe;
            border-radius: 4px;
            user-select: none;

            &:hover {
                opacity: 0.7;
            }

            &:active {
                position: relative;
                top: 1px;
                opacity: 0.5;
            }
        }
    }
</style>