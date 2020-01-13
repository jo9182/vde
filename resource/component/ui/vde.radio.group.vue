<template>
    <div class="radio-group">
        <div @click="selectedItem = item" class="radio-item" v-for="item in items">
            <div class="radio" :class="selectedItem === item ?'selected' :''">
                <div class="round"></div>
            </div>
            <div class="title">{{ item }}</div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "vde-radio-group",
        props: {
            items: Array
        },
        mounted() {

        },
        methods: {

        },
        data() {
            return {
                selectedItem: null
            }
        }
    }
</script>

<style lang="scss" scoped>
    .radio-group {
        .radio-item {
            display: flex;
            margin-bottom: 10px;
            cursor: pointer;
            font-size: 12px;
            align-items: center;

            .radio {
                width: 16px;
                height: 16px;
                background: #4b4b4b;
                border-radius: 8px;
                margin-right: 5px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: opacity, background-color, 0.2s;
                box-shadow: 0 1px 1px 0 #0a0a0a;

                &:hover {
                    background: #6b6b6b;
                }

                &:active {
                    position: relative;
                    opacity: 0.5;
                    top: 1px;
                }

                .round {
                    transition: opacity, scale, 0.3s;
                    width: 9px;
                    height: 9px;
                    background: #bbb;
                    border-radius: 5px;
                    opacity: 0;
                    transform: scale(1.5);
                }
            }

            .radio.selected {
                background: #d03d58;

                .round {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            .title {
                color: #bbb;
                font-size: 12px;
                margin-left: 5px;
            }
        }

        .radio-item:last-child {
            margin-bottom: 0;
        }
    }
</style>