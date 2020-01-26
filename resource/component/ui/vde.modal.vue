<template>
    <div class="vde-modal">
        <slot></slot>
    </div>
</template>

<script>
    export default {
        name: "vde-modal",
        props: {

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
    .vde-modal {
        position: absolute;
        left: 0;
        top: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #00000070;
        width: 100%;
        height: 100%;
        flex-direction: column;
    }
</style>