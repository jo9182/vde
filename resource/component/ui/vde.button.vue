<template>
    <button class="vde-button" :class="selected ?'selected' :''" @click="$emit('click')">{{ title }}</button>
</template>

<script>
    export default {
        name: "vde-number-range",
        props: {
            title: String,
            selected: Boolean
        },
        mounted() {

        },
        methods: {

        },
        data() {
            return {

            }
        }
    }
</script>

<style lang="scss" scoped>
    .vde-button {
        padding: 5px 10px;
        font-size: 12px;
        border: 0;
        background: #4b4b4b;
        color: #bbbbbb;
        transition: opacity, background-color, 0.2s;
        box-shadow: 0 1px 1px 0 #0a0a0a;
        border-radius: 2px;

        &:hover {
            background: #6b6b6b;
        }

        &:active {
            color: #4b4b4b;
            background: #3b3b3b;
            position: relative;
            top: 1px;
            box-shadow: 0 0 0 0 #0a0a0a;
        }
    }

    .vde-button.selected {
        background: #d03d58;
    }
</style>