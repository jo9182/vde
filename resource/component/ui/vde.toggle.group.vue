<template>
    <div class="toggle-group button-group">
        <!--<button @click="selectItem(item)" class="button base"
                :class="item === selectedItem ?'selected' :''"
                v-for="item in items">{{ item }}</button>-->

        <vde-button @click="selectItem(item)" :selected="item === selectedItem" v-for="item in items" :title="item"></vde-button>
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
            selectItem(item) {
                this.selectedItem = item;
                this.$emit('change', item);
            }
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