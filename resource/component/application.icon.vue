<template>
    <!--<draggable :start="position">-->
        <div class="app-icon" :class="storage.desktop.isRemoveMode ?'remove-icon' :''">
            <!--<img v-on:click="click(appData.name)"
                 :src="appData.icon || '/image/application.png'"
                 :alt="appData.title"
            draggable="false">-->
            <div class="icon" v-long-press="1000" @long-press-start.stop="onLongPressStart" v-on:click.stop="click(appData.name)" :style="{ animationDelay: Math.random() / 5 + 's', width: '56px', height: '56px', background: `center / contain no-repeat url(${appData.icon || '/image/application.png'})` }">
                <i @click.stop="removeApp(appData.name)" v-if="storage.desktop.isRemoveMode" class="fas fa-times"></i>
            </div>
            <div class="title">
                <span v-if="appData.isNeedToUpdate"></span>
                {{ appData.title }}
            </div>
        </div>
    <!--</draggable>-->
</template>

<script>
    import SceneApi from "../js/scene.api";
    import DataStorage from "../js/data.storage";

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
                if (DataStorage.desktop.isRemoveMode) return;
                SceneApi.runApplication(appName);
            },
            onLongPressStart() {
                DataStorage.desktop.isRemoveMode = true;
            },
            removeApp(appName) {
                console.log(appName);
                setTimeout(() => {
                    DataStorage.desktop.isRemoveMode = false;
                });
            }
        },
        data() {
            return {
                storage: DataStorage
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>