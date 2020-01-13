<template>
    <input class="vde-input" @change="$emit('change', $event)" type="text">
</template>

<script>
    export default {
        name: "vde-input",
        props: {

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
    .vde-input {
        background: #4b4b4b;
        border: 1px solid transparent;
        color: #bbbbbb;
        padding: 5px;
        font-size: 12px;
        box-shadow: 0 1px 1px 0 #0a0a0a;
        border-radius: 2px;

        &:hover {
            background: #5b5b5b;
        }

        &:focus {
            background: #6b6b6b;
        }
    }
</style>