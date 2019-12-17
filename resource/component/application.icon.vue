<template>
    <!--<draggable :start="position">-->
        <div class="app-icon caption">
            <!--<img v-on:click="click(appData.name)"
                 :src="appData.icon || '/image/application.png'"
                 :alt="appData.title"
            draggable="false">-->
            <div class="icon" v-long-press="1000" @long-press-start="onLongPressStart" v-on:click="click(appData.name)" :style="{ width: '56px', height: '56px', background: `center / contain no-repeat url(${appData.icon || '/image/application.png'})` }">

            </div>
            <div class="title">{{ appData.title }}</div>
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
            },
            onLongPressStart() {
                alert(1);
            }
        },
        data() {
            return {}
        }
    }
</script>

<style lang="scss" scoped>

</style>