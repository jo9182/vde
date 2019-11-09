<template>
    <draggable :source="windowData" style="display: flex; flex-direction: column;"
               :resizable="true" :start-drag="startDrag" :stop-drag="stopDrag" :disabled="isMobile">
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
                <!-- Modules -->
                <iframe v-show="module.sessionKey === selectedModule || splitMode" ref="module" :src="module.url"
                        v-for="module in windowData.modules"></iframe>

                <!-- Over body -->
                <div v-if="isDrag" class="over-body"></div>

                <!-- Options -->
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
                    <button @click="saveOptions" class="base success">Save</button>
                </div>

                <!-- Settings -->
                <div v-if="windowData.showSettings" class="settings">
                    <div v-for="setting in windowData.settings">
                        <div class="field">
                            <div style="flex: 0.5;">{{ setting.key }}</div>

                            <!-- Label field -->
                            <div v-if="setting.type === 'label'">
                                <span v-html="setting.value"></span>
                            </div>

                            <!-- Text field -->
                            <div v-if="setting.type === 'text'">
                                <input type="text" v-model="setting.value">
                            </div>

                            <!-- Text area field -->
                            <div v-if="setting.type === 'textarea'">
                                <textarea v-model="setting.value"></textarea>
                            </div>

                            <!-- Button -->
                            <div v-if="setting.type === 'button'">
                                <button class="base success" @click="settingsButtonAction(setting.click)">{{ setting.value }}</button>
                            </div>
                        </div>
                    </div>
                    <button @click="saveSettings" class="base">Save</button>
                </div>
            </div>

            <!-- Modules -->
            <div class="modules">
                <div @click="selectModule(module.sessionKey)" v-for="module in windowData.modules"
                     :class="module.sessionKey === selectedModule ?'selected-module' :''">
                    {{ module.appInfo.title }}
                </div>
                <div @click="splitMode = !splitMode" style="margin-left: auto;" :style="splitMode ?{background: 'rgb(28, 182, 25)'} :{}">
                    |
                </div>
            </div>
        </div>
    </draggable>
</template>

<script>
    import SceneApi from "../js/scene.api";
    import DataStorage from "../js/data.storage";
    import AppApi from "../js/app.api";

    export default {
        name: "application-window",
        props: {
            windowData: Object
        },
        computed: {
            isMobile() {
                return DataStorage.device.isMobile;
            }
        },
        mounted() {
            // Register session iFrame window
            DataStorage.sessionWindow[this.windowData.sessionKey] = this.$refs.module[0].contentWindow;

            // Main module
            this.selectedModule = this.windowData.sessionKey;

            // At this point app is init fully and ready for work
            this.windowData.isReady = async () => {
                let modules = this.windowData.getSetting('modules');
                if (!modules) return null;

                // Parse module declaration
                let modulesTuple = modules.split(";").map(x => x.trim().split(":").map(x2 => x2.trim()))
                    .filter(x => x.length === 2);

                // Go through all modules
                for (let i = 0; i < modulesTuple.length; i++) {
                    // Get app name
                    let appName = modulesTuple[i][0].replace(/(\([a-zA-Z0-9_ ]+\))/g, '');
                    let appAlias = modulesTuple[i][0].between("(", ")");

                    // Get channels info
                    let channelInfo = modulesTuple[i][1].split(',')
                        .map(x => x.trim()).map(
                            x => {
                                if (x.includes("->")) return [...x.split("->").map(x2 => x2.trim()), '->'];
                                else return [...x.split("<-").map(x2 => x2.trim()), '<-'];
                            }
                        );

                    // Run app if exists
                    let app = await SceneApi.runApplication(appName, true);
                    if (!app) continue;
                    if (appAlias) app.appInfo.title = appAlias;

                    // Save module
                    this.windowData.modules.push(app);

                    // Register module
                    await this.registerModule(app.sessionKey, i + 1);

                    // Connect channels
                    for (let j = 0; j < channelInfo.length; j++) {
                        // Main app send to module
                        if (channelInfo[j][2] === "<-") {
                            SceneApi.connectWindows(
                                this.windowData.sessionKey, app.sessionKey,
                                channelInfo[j][1], channelInfo[j][0]
                            );
                        }

                        // Nodule send to main
                        if (channelInfo[j][2] === "->") {
                            SceneApi.connectWindows(
                                app.sessionKey, this.windowData.sessionKey,
                                channelInfo[j][0], channelInfo[j][1]
                            );
                        }
                    }
                }
            };
        },
        methods: {
            registerModule(sessionKey, id) {
                return new Promise(resolve => {
                    // Wait until contentWindow is ready
                    setTimeout(() => {
                        // Register module iFrame window
                        DataStorage.sessionWindow[sessionKey] = this.$refs.module[id].contentWindow;
                        resolve();
                    });
                });
            },
            settingsButtonAction(action) {
                if (action) action(this);
            },
            sendIFrameEvent(eventName, data) {
                this.$refs.module[0].contentWindow.postMessage({
                    isEvent: true,
                    event: eventName,
                    data: data
                }, '*');
            },
            async saveSettings() {
                this.windowData.showSettings = false;

                // Convert list to object
                let object = {};
                for (let i = 0; i < this.windowData.settings.length; i++) {
                    if (this.windowData.settings[i].type === 'button') continue;
                    if (this.windowData.settings[i].type === 'label') continue;
                    object[this.windowData.settings[i].key] = this.windowData.settings[i].value;
                }

                // Save settings
                await AppApi.saveSettings(this.windowData.appInfo.name, object);

                // Reload app list
                await SceneApi.reloadApplicationList();
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
            selectModule(moduleId) {
                this.selectedModule = moduleId;
            },
            clickTab(tab) {
                this.sendIFrameEvent('tabClicked', tab);
            },
            reload() {
                let iFrame = this.$refs.module[0];
                iFrame.src = iFrame.src;
            },
            settings() {
                this.windowData.showSettings = !this.windowData.showSettings;
            },
            close() {
                // Delete session
                delete DataStorage.sessionWindow[this.windowData.sessionKey];
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
                splitMode: false,
                isDrag: false,
                selectedModule: 0
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
        user-select: none;

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
            position: relative;
            overflow: hidden;
            flex-direction: column;

            iframe {
                border: 0;
                width: 100%;
                height: 100%;
            }
        }

        .modules {
            display: flex;
            padding: 3px;

            > div {
                background: #2b2b2b;
                padding: 2px 5px;
                margin-right: 5px;
                font-size: 12px;
                cursor: pointer;
                border-radius: 3px;
            }
        }

        .selected-module {
            background: #f54c0b !important;
        }

        .over-body {
            position: absolute;
            width: 100%;
            height: 100%;
        }

        .options, .settings {
            background: #f7f8fc;
            color: #363636;
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
                user-select: text;

                > div:first-child {
                    text-transform: uppercase;
                }

                > div {
                    flex: 1;
                    display: flex;

                    input, select, textarea, button {
                        flex: 1;
                    }

                    textarea {
                        resize: vertical;
                        height: 64px;
                    }
                }
            }
        }
    }
</style>