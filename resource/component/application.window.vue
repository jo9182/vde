<template>
    <resizable :area="windowData" v-on:startDrag="startDrag">
        <div class="window">
            <div class="caption">
                <div class="title">{{ windowData.title }}</div>
                <div @click="openSettings" style="cursor: pointer; margin-right: 10px;">*</div>
                <div @click="close" style="cursor: pointer;">x</div>
            </div>
            <div class="body">
                <!-- Dependencies left -->
                <div v-if="winGrid.position === 'left'" v-for="winGrid in windowData.dependencies"
                     :style="winGrid.style">
                    <div v-for="winDep in winGrid.applications" :style="winDep.style" style="overflow: hidden;">
                        <iframe :src="winDep.url + '#sessionId=' + winDep.sessionId + '&x=1'"></iframe>
                    </div>
                </div>

                <!-- Main app -->
                <div style="flex: 1;">
                    <iframe ref="mainFrame"
                            :src="windowData.url + '#sessionId=' + windowData.sessionId + '&x=1'"></iframe>
                </div>

                <!-- Dependencies right -->
                <div v-if="winGrid.position === 'right'" v-for="winGrid in windowData.dependencies"
                     :style="winGrid.style">
                    <div v-for="winDep in winGrid.applications" :style="winDep.style" style="overflow: hidden;">
                        <iframe :src="winDep.url + '#sessionId=' + winDep.sessionId + '&x=1'"></iframe>
                    </div>
                </div>

                <!-- Settings -->
                <div v-if="showSettings" style="position: absolute; width: 100%; height: 100%; background: #333333; padding: 10px;">
                    <!-- Version -->
                    <div style="display: flex;">
                        <div>Current Version</div>
                        <div>{{ version }}</div>
                    </div>

                    <!-- Version -->
                    <div style="display: flex;">
                        <div>Version</div>
                        <select @change="selectVersion">
                            <option value="">--select version</option>
                            <option :value="version" v-for="version in versionList">{{ version }}</option>
                        </select>
                        <button @click="setVersion">set</button>
                    </div>
                </div>

                <!-- Over body -->
                <div v-if="windowData.isDraggable" style="position: absolute; width: 100%; height: 100%;"></div>
            </div>

            <!-- Input -->
            <div ref="inputPorts" v-for="(input, index) in windowData.input" class="input" :style="inputPosition(index)"></div>

            <!-- Output -->
            <div ref="outputPorts" v-for="(output, index) in windowData.output" class="output" :style="outputPosition(index)"></div>
        </div>
    </resizable>
</template>

<script>
    import VDECore from "../js/core";
    import Storage from "../js/storage";

    export default {
        name: "application-window",
        props: {
            windowData: Object
        },
        mounted() {
            Storage.sessionWindow[this.windowData.sessionId] = this.$refs.mainFrame.contentWindow;
            //Storage.windowSessionRef[this.windowData.sessionId] = this;

            // Grid
            for (let winGrid in this.windowData.dependencies) {
                for (let i = 0; i < this.windowData.dependencies[winGrid].applications.length; i++) {
                    let application = this.windowData.dependencies[winGrid].applications[i];
                    if (application.connectToMain) {
                        VDECore.connectWindow(
                            application.sessionId,
                            application.connectToMain[0],
                            this.windowData.sessionId,
                            application.connectToMain[1]
                        );
                    }
                }
            }
        },
        methods: {
            portLocation(type, id) {
                if (type === 'input' && this.$refs.inputPorts && this.$refs.inputPorts[id]) {
                    let area = this.$refs.inputPorts[id].getBoundingClientRect();
                    area.x += 8;
                    area.y += 8;
                    return area;
                }
                if (type === 'output' && this.$refs.outputPorts && this.$refs.outputPorts[id]) {
                    let area = this.$refs.outputPorts[id].getBoundingClientRect();
                    area.x += 8;
                    area.y += 8;
                    return area;
                }
                return null;
            },
            inputPosition(index) {
                return {
                    left: -24 + 'px',
                    bottom: (index * 24) + 'px'
                }
            },
            outputPosition(index) {
                return {
                    right: -24 + 'px',
                    bottom: (index * 24) + 'px'
                }
            },
            startDrag() {
                for (let i = 0; i < Storage.windowList.length; i++)
                    Storage.windowList[i].zIndex = 0;
                this.windowData.zIndex = 1;
            },
            openSettings() {
                this.showSettings = !this.showSettings;
                this.getVersionList();
            },
            async getVersionList() {
                this.versionList.length = 0;

                let version = await VDECore.getApplicationVersion(this.windowData.appName);
                this.version = version.data;

                let list = await VDECore.getApplicationVersionList(this.windowData.appName);

                for (let i = 0; i < list.data.length; i++) {
                    /*list.data.list[i].date = new Date(list.data.list[i].date).getFullYear()
                        + '-' + ('00' + new Date(list.data.list[i].date).getMonth()).slice(-2)
                        + '-' + ('00' + new Date(list.data.list[i].date).getDay()).slice(-2)
                        + ' ' + ('00' + new Date(list.data.list[i].date).getHours()).slice(-2)
                        + ':' + ('00' + new Date(list.data.list[i].date).getMinutes()).slice(-2)
                        + ':' + ('00' + new Date(list.data.list[i].date).getSeconds()).slice(-2);*/

                    this.versionList.push(list.data[i]);
                }
            },
            selectVersion(e) {
                this.selectedVersion = e.target.value;
            },
            async setVersion() {
                await VDECore.setApplicationVersion(this.windowData.appName, this.selectedVersion);
                this.showSettings = false;
                this.$refs.mainFrame.contentWindow.location.reload();
            },
            close() {
                VDECore.closeWindow(this.windowData.sessionId);
            }
        },
        data() {
            return {
                selectedVersion: '',
                version: '',
                versionList: [],
                showSettings: false
            }
        }
    }
</script>

<style lang="scss" scoped>
    .window {
        background: #7d7d7d;
        // position: absolute;
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

        .input {
            position: absolute;
            right: 0;
            bottom: 0;
            border: 1px solid #ffb227;
            width: 16px;
            height: 16px;
        }

        .output {
            position: absolute;
            right: 0;
            bottom: 0;
            border: 1px solid #ff0000;
            width: 16px;
            height: 16px;
        }
    }
</style>