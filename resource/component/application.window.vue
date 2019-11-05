<template>
    <draggable :start="windowData" style="display: flex; flex-direction: column;"
               :resizable="true" :start-drag="startDrag" :stop-drag="stopDrag">
        <div class="window">
            <div class="caption" data-draggable="true">
                <div class="title">{{ windowData.appInfo.title }}</div>
                <div @click="reload" style="cursor: pointer; margin-right: 10px;">@</div>
                <div @click="settings" style="cursor: pointer; margin-right: 10px;">*</div>
                <div @click="close" style="cursor: pointer;">x</div>
            </div>
            <div v-if="windowData.tabs.length" class="tabs">
                <div @click="clickTab(tab)" class="tab" v-for="tab in windowData.tabs">
                    {{ tab }}
                </div>
            </div>
            <div class="body">
                <iframe ref="mainFrame" :src="windowData.url"></iframe>

                <!-- Over body -->
                <div v-if="isDrag" class="over-body"></div>

                <div v-if="windowData.showOptions" class="options">
                    <div v-for="option in windowData.options">
                        <!-- Text field -->
                        <div v-if="option.type === 'text'" class="field">
                            <div>{{ option.key }}</div>
                            <div>
                                <input type="text" v-model="option.value">
                            </div>
                        </div>

                        <!-- Select -->
                        <div v-if="option.type === 'select'" class="field">
                            <div>{{ option.key }}</div>
                            <div>
                                <select @change="option.value = $event.target.value">
                                    <option :value="selectOption" v-for="selectOption in option.options" :selected="selectOption == option.value">
                                        {{ selectOption }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <button @click="saveOptions">Save</button>
                </div>
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
            console.log(this.windowData);
        },
        methods: {
            sendIFrameEvent(eventName, data) {
                this.$refs.mainFrame.contentWindow.postMessage({
                    isEvent: true,
                    event: eventName,
                    data: data
                }, '*');
            },
            saveOptions() {
                // Convert list to object
                let object = {};
                for (let i = 0; i < this.windowData.options.length; i++) {
                    object[this.windowData.options[i].key] = Object.assign({}, this.windowData.options[i]);
                    delete object[this.windowData.options[i].key].key;
                }

                // Send to client
                this.sendIFrameEvent('optionsChanged', object);
                this.windowData.showOptions = false;
            },
            clickTab(tab) {
                this.sendIFrameEvent('tabClicked', tab);
            },
            reload() {
                let iFrame = this.$refs.mainFrame;
                iFrame.src = iFrame.src;
            },
            settings() {

            },
            close() {
                SceneApi.closeApplication(this.windowData.sessionKey);
            },
            startDrag() {
                this.isDrag = true;
            },
            stopDrag() {
                this.isDrag = false;
            }
        },
        data() {
            return {
                isDrag: false
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
        border: 1px solid #212121;

        .caption {
            background: #3b3b3b;
            padding: 10px;
            user-select: none;
            display: flex;

            .title {
                flex: 1;
            }
        }

        .tabs {
            user-select: none;
            padding: 5px;
            display: flex;

            .tab {
                cursor: pointer;
                margin-right: 5px;
                background: #1a1a1a;
                font-size: 12px;
                padding: 1px 10px;
                border-radius: 18px;

                &:hover {
                    opacity: 0.8;
                }

                &:active {
                    opacity: 0.6;
                    position: relative;
                    top: 1px;
                }
            }
        }

        .body {
            display: flex;
            flex: 1;
            //border: 1px solid #212121;
            position: relative;
            overflow: hidden;

            iframe {
                border: 0;
                width: 100%;
                height: 100%;
            }
        }

        .over-body {
            position: absolute;
            width: 100%;
            height: 100%;
        }

        .options {
            background: #3b3b3b;
            position: absolute;
            width: 100%;
            height: 100%;
            padding: 10px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;

            .field {
                display: flex;
                margin-bottom: 10px;

                > div {
                    flex: 1;
                    display: flex;

                    input, select {
                        flex: 1;
                    }
                }
            }
        }
    }
</style>