<template>
    <div class="system-settings" :style="{opacity: opacity}">
        <div class="block">
            <input type="text">
        </div>
    </div>
</template>

<script>
    import SceneApi from "../js/scene.api";
    import DataStorage from "../js/data.storage";
    import UserApi from "../js/user.api";

    export default {
        name: "system-settings",
        props: {

        },
        mounted() {
            setTimeout(() => {
                this.opacity = 1;
            });
        },
        methods: {

        },
        data() {
            return {
                storage: DataStorage,
                opacity: 0
            }
        }
    }
</script>

<style lang="scss" scoped>
    .system-settings {
        position: absolute;
        width: 100%;
        height: calc(100% - 25px);
        background: #000000b3;
        z-index: 128;
        margin-top: 25px;
        padding: 10px;
        opacity: 0;
        transition: opacity, 0.3s;
    }
</style>