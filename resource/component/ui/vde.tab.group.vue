<template>
    <div class="vde-tab-group">
        <div v-for="x in currentItems" @click="select(x)" :class="x.id === selectedItem ?'active' :''">
            {{ x.title }} <i @click.stop="$emit('remove', x.id)" class="fas fa-times" style="margin-left: 5px;"></i>
        </div>
    </div>
</template>

<script>
    export default {
        name: "vde-tab-group",
        props: {
            items: Array
        },
        mounted() {
            this.updateData();
        },
        beforeDestroy() {

        },
        methods: {
            select(x) {
                this.selectedItem = x.id;
                this.$emit('select', x.id);
            },
            updateData() {
                this.currentItems.length = 0;
                for (let i = 0; i < this.items.length; i++) {
                    if (typeof this.items[i] === 'string') {
                        this.currentItems.push({
                            id: this.items[i],
                            title: this.items[i]
                        });
                    } else {
                        this.currentItems.push({
                            id: this.items[i].id,
                            title: this.items[i].title
                        });
                    }
                }
            }
        },
        watch: {
            items() {
                this.updateData();
            }
        },
        data() {
            return {
                currentItems: [],
                selectedItem: null
            }
        }
    }
</script>

<style lang="scss" scoped>
    .vde-tab-group {
        display: flex;
        user-select: none;

        > div {
            padding: 5px 8px 5px 10px;
            background: #3c3c3c;
            font-size: 12px;
            border: 1px solid #2b2b2b;
            border-right: 0;
            cursor: pointer;
            color: #7e7e7e;

            &:hover {
                background: #484848;
            }
            &:active {
                background: #2d2d2d;
            }

            > i {
                &:hover {
                    opacity: 0.8;
                }
                &:active {
                    opacity: 0.6;
                }
            }
        }

        > div.active {
            background: #4b4b4b;
            color: #bbbbbb;

            &:hover {
                background: #4b4b4b;
            }
            &:active {
                background: #4b4b4b;
            }
        }
    }
</style>