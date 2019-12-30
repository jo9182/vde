<template>
    <div class="number-range">
        <div @click="prev" class="left-button">-</div>
        <div><input type="text" v-model="val"></div>
        <div @click="next" class="right-button">+</div>
    </div>
</template>

<script>
    export default {
        name: "vde-number-range",
        props: {

        },
        mounted() {

        },
        methods: {
            prev() {
                this.val = this.val * 1 - this.step;
                this.constrain();
            },
            next() {
                this.val = this.val * 1 + this.step;
                this.constrain();
            },
            constrain() {
                if (this.val < this.min) this.val = this.min * 1;
                if (this.val > this.max) this.val = this.max * 1;
                this.val = this.val.toFixed(2) * 1;
            }
        },
        data() {
            return {
                min: 0,
                max: 1,
                step: 0.1,
                val: 0
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