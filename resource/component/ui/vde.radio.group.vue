<template>
    <div class="radio-group">
        <div @click="selectedItem = item" class="radio-item" v-for="item in items">
            <div class="radio">
                <div v-if="selectedItem === item" class="selected"></div>
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

                .selected {
                    width: 9px;
                    height: 9px;
                    background: #fefefe;
                    border-radius: 5px;
                }
            }
        }
    }
</style>