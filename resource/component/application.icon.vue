<template>
    <!--<draggable :start="position">-->
        <div class="app-icon caption">
            <img v-on:dblclick="click(appData.name)" v-on:click="tap(appData.name)"
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
            tap(appName) {
                if (DataStorage.device.isMobile)
                    SceneApi.runApplication(appName);
            },
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

</style>