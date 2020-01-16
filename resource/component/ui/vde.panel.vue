<template>
    <div class="vde-panel">
        <div class="vde-panel-title">{{ title }}</div>
        <div class="vde-panel-body scroll-mini" :style="[vertical ?{ flexDirection: 'column' } :null, scrollY ?{overflowY: 'scroll'} :null]">
            <slot></slot>
        </div>
    </div>
</template>

<script>
    export default {
        name: "vde-panel",
        props: {
            title: String,
            vertical: Boolean,
            scrollY: Boolean
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
        padding: 5px;
        border: 1px solid #4b4b4b;
        border-radius: 2px;
        position: relative;

        .vde-panel-title {
            font-size: 12px;
            position: absolute;
            top: -7px;
            left: 4px;
            background: #2b2b2b;
            padding: 0 7px;
        }

        .vde-panel-body {
            padding: 5px;
            display: flex;
            flex: 1;
        }
    }
</style>