<template>
    <div class="vde-side-bar">
        <div @click="select(x)" class="item" v-for="x in items" :class="currentSelected === x ?'selected' :''">
            {{ x }}
        </div>
    </div>
</template>

<script>
    export default {
        name: "vde-side-bar",
        props: {
            items: Array,
            selected: String
        },
        mounted() {
            this.select(this.selected);
        },
        beforeDestroy() {

        },
        methods: {
            select(x) {
                this.currentSelected = x;
            }
        },
        data() {
            return {
                currentSelected: ''
            }
        }
    }
</script>

<style lang="scss" scoped>
    .vde-side-bar {
        .item {
            user-select: none;
            cursor: pointer;
            padding: 5px;
            transition: background-color, 0.2s;

            &:hover {
                background: #3b3b3b;
            }

            &:active {
                background: #1b1b1b;
            }
        }

        .item.selected {
            background: #d03d58;
        }
    }
</style>