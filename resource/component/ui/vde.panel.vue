<template>
    <div class="vde-panel" :style="vertical ?{ flexDirection: 'column' } :{}">
        <slot></slot>
    </div>
</template>

<script>
    export default {
        name: "vde-panel",
        props: {
            vertical: Boolean
        },
        mounted() {

        },
        beforeDestroy() {

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
    .vde-panel {
        display: flex;
        padding: 10px;
        border: 1px solid #4b4b4b;
        border-radius: 2px;
    }
</style>