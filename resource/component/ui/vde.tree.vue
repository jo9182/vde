<template>
    <div class="vde-tree">
        <div class="item" v-for="x in data" :r="r" :cr="cr">
            <div v-if="x.isFolder">
                <div class="folder" :class="x.isOpen ?'open' :''" @click="open(x)" v-if="x.name !== '..'">
                    <i class="arrow fas fa-sort-down"></i>
                    <i class="icon fas" :class="x.isOpen ?'fa-folder-open' :'fa-folder'"></i>
                    <div class="title" style="">{{ x.name }}</div>
                </div>
                <vde-tree v-if="x.isOpen"
                          :data="x.files"
                          style="padding-left: 21px;"
                          :is-children="true"
                          v-on:select="select($event)"
                          :selected="selected" :r="cr"></vde-tree>
            </div>
            <div @click.stop="select(x.path)" class="file" :class="selected.includes(x.path) ?'selected' :''" v-if="!x.isFolder" style="margin-left: 15px; display: flex;">
                <i class="fas fa-file"></i>
                <div class="title">{{ x.name }}</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "vde-tree",
        props: {
            data: Array,
            isChildren: Boolean,
            selected: Array,
            r: Number
        },
        mounted() {
            if (this.isChildren) return;

            document.addEventListener('click', () => {
                this.selected.length = 0;
                this.cr = Math.random();
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Control') this.isControl = true;
                if (e.key === 'Shift') this.isShift = true;
            });
            document.addEventListener('keyup', (e) => {
                if (e.key === 'Control') this.isControl = false;
                if (e.key === 'Shift') this.isShift = false;
            });
        },
        beforeDestroy() {

        },
        methods: {
            open(x) {
                x.isOpen = !x.isOpen;
                this.cr = Math.random();
            },
            select(x) {
                if (this.isChildren) {
                    this.$emit('select', x);
                } else {
                    if (!this.isControl) this.selected.length = 0;
                    this.selected.push(x);
                }
                this.cr = Math.random();
            }
        },
        data() {
            return {
                isControl: false,
                isShift: false,
                cr: Math.random()
            }
        }
    }
</script>

<style lang="scss" scoped>
    .vde-tree {
        color: #bbbbbb;
        user-select: none;
        font-size: 14px;

        .item {
            cursor: pointer;

            .folder, .file {
                padding: 5px;

                .title {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }

            .folder {
                display: flex;
                align-items: center;

                .arrow {
                    position: relative;
                    top: -1px;
                    left: -3px;
                    transform: rotate(-90deg);
                }

                .icon {
                    margin-left: 5px;
                }

                .title {
                    margin-left: 5px;
                }
            }

            .folder.open {
                .arrow {
                    transform: rotate(0deg);
                    top: -3px;
                    left: 0;
                }

                .title {
                    margin-left: 3px;
                }
            }

            .file {
                .title {
                    margin-left: 5px;
                }
            }

            .file.selected {
                background: #d03d58;
            }
        }
    }
</style>