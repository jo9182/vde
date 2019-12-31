<template>
    <div class="radio-group">
        <div @click="selectedItem = item" class="radio-item" v-for="item in items">
            <div class="radio" :class="selectedItem === item ?'selected' :''">
                <div class="round"></div>
            </div>
            <div>{{ item }}</div>
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
                background: #3c4e82;
                border-radius: 8px;
                margin-right: 5px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: opacity, 0.2s;

                &:hover {
                    opacity: 0.8;
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
                    background: #fefefe;
                    border-radius: 5px;
                    opacity: 0;
                    transform: scale(2);
                }
            }

            .radio.selected{
                .round {
                    opacity: 1;
                    transform: scale(1);
                }
            }
        }
    }
</style>