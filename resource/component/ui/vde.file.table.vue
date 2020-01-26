<template>
    <div style="display: flex; background: #404040; border-radius: 5px;">
        <vde-table :header="tableHeader" :data="fileList"
                   :scroll-y="scrollY"
                   v-on:select="clickOnFile($event)" style="flex: 1;"></vde-table>
    </div>
</template>

<script>
    export default {
        name: "vde-file-table",
        props: {
            path: String,
            scrollY: Boolean
        },
        async mounted() {
            // this.fileTree = await VDE.getFileTree(this.path || '/', this.location || 'docs', this.filter || '.*');
            // console.log(this.fileTree);
            this.refreshFileList();
        },
        beforeDestroy() {

        },
        methods: {
            clickOnFile(file) {
                if (file.isFolder) {
                    if (file.name === '..') {
                        this.currentPath = this.currentPath.split('/').slice(0, -1).join('/') || '/';
                    } else {
                        if (this.currentPath === '/') this.currentPath += file.name;
                        else this.currentPath += '/' + file.name;
                    }

                    this.$emit('change', this.currentPath.slice(-1) === '/' ?this.currentPath :this.currentPath + '/');

                    this.refreshFileList();
                } else {
                    this.$emit('select', (this.currentPath.slice(-1) === '/' ?this.currentPath :this.currentPath + '/') + file.name);
                }
            },
            async refreshFileList() {
                this.fileList = await VDE.getFileList(this.currentPath, 'docs');
                if (this.currentPath !== '/') {
                    this.fileList.unshift({
                        name: '..',
                        isFolder: true,
                        created: null,
                        size: 0
                    });
                }
                for (let i = 0; i < this.fileList.length; i++) {
                    this.fileList[i].type = this.fileList[i].isFolder ?'folder' :'file';
                }
            },
        },
        data() {
            return {
                currentPath: '/',
                fileList: [],
                tableHeader: [
                    {
                        title: 'name',
                        columnWidth: 1.5,
                        format(value, row) {
                            return (row.isFolder ? '<i class="fas fa-folder" style="color: #db9d2c; width: 14px;"></i> ' : '<i class="fas fa-file" style="color: #bbd8e1; width: 14px;"></i> ') + value;
                        }
                    },
                    {
                        title: 'size:int',
                        columnWidth: 0.45,
                        format(value) {
                            return value.humanByteSize();
                        }
                    },
                    {
                        title: 'type',
                        columnWidth: 0.3,
                    },
                    {
                        title: 'created',
                        format(value, row) {
                            return new Date(value).humanDate();
                        }
                    }
                ]
            }
        }
    }
</script>

<style lang="scss" scoped>
    .vde-file-table {

    }
</style>