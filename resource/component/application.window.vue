<template>
    <draggable :start="windowData" style="display: flex; flex-direction: column;" :resizable="true">
        <div class="window">
            <div class="caption">
                <div class="title">{{ windowData.appInfo.title }}</div>
                <div @click="settings" style="cursor: pointer; margin-right: 10px;">*</div>
                <div @click="close" style="cursor: pointer;">x</div>
            </div>
            <div class="body">
                <iframe ref="mainFrame" :src="windowData.url"></iframe>
            </div>
        </div>
    </draggable>
</template>

<script>
    import SceneApi from "../js/scene.api";

    export default {
        name: "application-window",
        props: {
            windowData: Object
        },
        mounted() {

        },
        methods: {
            settings() {

            },
            close() {
                SceneApi.closeApplication(this.windowData.sessionKey);
            }
        },
        data() {
            return {

            }
        }
    }
</script>

<style lang="scss" scoped>
    .window {
        background: #7d7d7d;
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;

        .caption {
            background: #3b3b3b;
            padding: 10px;
            user-select: none;
            display: flex;

            .title {
                flex: 1;
            }
        }

        .body {
            display: flex;
            flex: 1;
            border: 1px solid #212121;
            position: relative;
            overflow: hidden;

            iframe {
                border: 0;
                width: 100%;
                height: 100%;
            }
        }
    }
</style>