<template>
    <div class="vde-input">
        <input ref="input" v-if="!disabled"
               @change="processInput('change', $event)"
               v-bind:value="value"
               @input="processInput('input', $event)"
               type="text">
        {{ disabled ?model :'' }}
    </div>
</template>

<script>
    export default {
        name: "vde-input",
        props: {
            disabled: Boolean,
            value: [String, Number, Date, Boolean, Object],
            mask: String
        },
        mounted() {

        },
        methods: {
            focus() {
                this.$refs.input.focus();
            },
            select() {
                this.$refs.input.select();
            },
            processInput(eventType, e) {
                if (this.mask === 'integer') e.target.value = e.target.value.replace(/\D/g, '');
                this.$emit(eventType, e.target.value);
            }
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

        font-size: 12px;
        box-shadow: 0 1px 1px 0 #0a0a0a;
        border-radius: 2px;
        display: flex;
        flex: 1;

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
            padding: 5px;
            border-radius: 0;
            flex: 1;
            color: #bbbbbb;
        }
    }
</style>