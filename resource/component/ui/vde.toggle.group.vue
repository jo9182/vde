<template>
    <div class="toggle-group button-group">
        <button @click="selectedItem = item" class="button base" :class="item === selectedItem ?'selected' :''" v-for="item in items">{{ item }}</button>
    </div>
</template>

<script>
    export default {
        name: "vde-toggle-group",
        props: {
            items: Array,
            selected: [String, Number]
        },
        mounted() {
            this.selectedItem = this.selected;
        },
        beforeDestroy() {

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
    .toggle-group {

    }
</style>