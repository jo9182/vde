<template>
    <draggable ref="draggable" :source="windowData" style="display: flex; flex-direction: column;"
               :resizable="true" :start-drag="startDrag" :stop-drag="stopDrag" :resize="onResize" :disabled="storage.device.isMobile">
        <div class="window">
            <!-- Header -->
            <div @touchstart="focusWindow" @mousedown="focusWindow" @click="focusWindow" class="caption" data-draggable="true">
                <div class="title">{{ windowData.appInfo.title }}</div>
                <div class="icon" @mousedown.stop="" @click="reload">
                    <!--<img src="/image/refresh.svg" alt="Close" draggable="false">-->
                    <i class="fas fa-redo-alt"></i>
                </div>
                <div class="icon options" @mousedown.stop="" @click="settings">
                    <!--<img src="/image/settings-icon.svg" alt="Settings" draggable="false">-->
                    <i class="fas fa-cog"></i>
                </div>
                <div class="icon close" @mousedown.stop="" @click="close">
                    <!--<img src="/image/close.svg" alt="Close" draggable="false">-->
                    <i class="fas fa-times"></i>
                </div>
            </div>

            <!-- Tabs -->
            <div v-if="windowData.tabs.length" class="tabs">
                <div @click="clickTab(tab)" class="tab" v-for="tab in windowData.tabs">
                    {{ tab }}
                </div>
            </div>

            <!-- Body -->
            <div class="body">
                <!-- Modules -->
                <iframe allowfullscreen v-show="module.sessionKey === selectedModule || splitMode" ref="module" :src="module.url"
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
            <div v-show="windowData.modules.length > 1" class="modules">
                <div @click="selectModule(module.sessionKey)" v-for="module in windowData.modules"
                     :class="module.sessionKey === selectedModule ?'selected-module' :''">
                    {{ module.appInfo.title }}
                </div>
                <div @click="splitMode = !splitMode" style="margin-left: auto;" :class="splitMode ?'selected-module' :''">
                    |
                </div>
            </div>

            <!-- Ports -->
            <div v-show="!storage.device.isMobile" @mouseup="dropPort(port)" class="port-in"
                 :id="'port-' + windowData.sessionKey + '-' + port"
                 v-for="(port, i) in windowData.ports.input" :style="{ bottom: i * 24 + 'px' }"></div>
            <div v-show="!storage.device.isMobile" @mousedown="dragPort(port)" class="port-out"
                 :id="'port-' + windowData.sessionKey + '-' + port"
                 v-for="(port, i) in windowData.ports.output" :style="{ bottom: i * 24 + 'px' }"></div>
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

        },
        mounted() {
            this.windowData.ref = this;

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
                                channelInfo[j][1], channelInfo[j][0],
                                false
                            );
                        }

                        // Nodule send to main
                        if (channelInfo[j][2] === "->") {
                            SceneApi.connectWindows(
                                app.sessionKey, this.windowData.sessionKey,
                                channelInfo[j][0], channelInfo[j][1],
                                false
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
            focusWindow() {
                this.$refs.module[0].contentWindow.focus();
                SceneApi.topWindow(this.windowData.sessionKey);
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
            resize(width, height) {
                this.$refs.draggable.setSize(width, height);
            },
            close() {
                this.isClosed = true;
                this.$refs.draggable.close();

                setTimeout(() => {
                    // Delete session
                    delete DataStorage.sessionWindow[this.windowData.sessionKey];
                    SceneApi.closeApplication(this.windowData.sessionKey);
                }, 250);
            },
            startDrag() {
                this.isDrag = true;
                DataStorage.event.isDrag = true;
            },
            stopDrag() {
                this.isDrag = false;
                DataStorage.event.isDrag = false;
            },
            dragPort(port) {
                DataStorage.dragData.port = port;
                DataStorage.dragData.fromWindowSessionKey = this.windowData.sessionKey;
            },
            dropPort(port) {
                SceneApi.connectWindows(
                    DataStorage.dragData.fromWindowSessionKey,
                    this.windowData.sessionKey,
                    DataStorage.dragData.port,
                    port
                );
            },
            onResize() {
                this.sendIFrameEvent('onResize', {
                    width: this.$refs.module[0].getBoundingClientRect().width,
                    height: this.$refs.module[0].getBoundingClientRect().height,
                });
            }
        },
        data() {
            return {
                storage: DataStorage,

                isClosed: false,
                splitMode: false,
                isDrag: false,
                selectedModule: 0
            }
        }
    }
</script>