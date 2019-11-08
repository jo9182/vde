<template>
    <!--<draggable :start="position">-->
        <div class="app-icon caption">
            <img v-on:dblclick="click(appData.name)"
                 :src="appData.icon || '/image/application.png'"
                 :alt="appData.title"
            draggable="false">
            <div>{{ appData.title }}</div>
        </div>
    <!--</draggable>-->
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
        // position: absolute;
        user-select: none;
        // width: 20%;
        padding: 15px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        img {
            cursor: pointer;
            // pointer-events: none;
            display: block;
            width: 100%;
            // height: 100%;
            max-height: 100%;
            max-width: 64px;
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