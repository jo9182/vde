<template>
    <!--<draggable :start="position">-->
        <div class="app-icon caption">
            <img v-on:click="click(appData.name)"
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

</style>