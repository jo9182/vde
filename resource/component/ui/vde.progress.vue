<template>
    <div class="vde-progress">
        <div style="height: 4px; background: #d03d58;" :style="{ width: value * 100 + '%' }"></div>
    </div>
</template>

<script>
    export default {
        name: "vde-progress",
        props: {
            value: Number
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
    .vde-progress {
        background: #121212;
        box-shadow: 0 1px 1px 0 #0a0a0a;
    }
</style>