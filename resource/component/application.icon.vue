<template>
    <draggable :start="position">
        <div class="app-icon caption" v-on:dblclick="click(appData.name)">
            <img :src="appData.icon || 'https://ru.vuejs.org/images/logo.png'" :alt="appData.title">
            <div>{{ appData.title }}</div>
        </div>
    </draggable>
</template>

<script>
    import SceneApi from "../js/scene.api";

    export default {
        name: "application-icon",
        props: {
            appData: Object,
            position: Object
        },
        mounted() {

        },
        methods: {
            click(appName) {
                SceneApi.runApplication(appName);
            }
        },
        data() {
            return {}
        }
    }
</script>

<style lang="scss" scoped>
    .app-icon {
        position: absolute;
        cursor: pointer;
        user-select: none;
        width: 48px;

        img {
            pointer-events: none;
            display: block;
            width: 100%;
            height: 100%;
        }

        div {
            text-align: center;
            margin-top: 7px;
            font-size: 12px;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
</style>