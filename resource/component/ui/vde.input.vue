<template>
    <div class="vde-input">
        <input v-if="!disabled"
               @change="$emit('change', $event.target.value)"
               v-bind:value="model"
               type="text">

        {{ disabled ?model :'' }}
    </div>
</template>

<script>
    export default {
        name: "vde-input",
        props: {
            model: String,
            disabled: Boolean
        },
        mounted() {

        },
        methods: {

        },
        data() {
            return {

            }
        }
    }
</script>

<style lang="scss" scoped>
    .vde-input {
        background: #4b4b4b;
        border: 1px solid transparent;
        color: #bbbbbb;
        padding: 5px;
        font-size: 12px;
        box-shadow: 0 1px 1px 0 #0a0a0a;
        border-radius: 2px;
        display: flex;

        &:hover {
            background: #5b5b5b;
        }

        &:focus {
            background: #6b6b6b;
        }

        input {
            background: none;
            border: 0;
            font-size: 12px;
            padding: 0;
            border-radius: 0;
        }
    }
</style>