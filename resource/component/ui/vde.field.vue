<template>
    <div class="vde-field">
        <div class="title">{{ title }}</div>
        <vde-input v-if="type === 'text'" :value="value" @change="$emit('change', $event)"></vde-input>
        <vde-select v-if="type === 'select'" :items="items" @change="$emit('change', $event)"></vde-select>
    </div>
</template>

<script>
    export default {
        name: "vde-field",
        props: {
            title: String,
            type: String,
            items: Array,
            value: [String, Number, Date, Boolean, Object]
        },
        mounted() {

        },
        model: {
            prop: 'value',
            event: 'change',
        },
        methods: {

        },
        data() {
            return {
                sas: Math.random() + ''
            }
        }
    }
</script>

<style lang="scss" scoped>
    .vde-field {
        margin-bottom: 10px;

        .title {
            font-size: 12px;
            margin-bottom: 5px;
        }
    }
</style>