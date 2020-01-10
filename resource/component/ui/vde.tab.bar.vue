<template>
    <div>
        <div class="toggle-group button-group">
            <button @click="select(item)" class="button base" :class="item === selectedItem ?'selected' :''" v-for="item in items">{{ item }}</button>
        </div>
        <div ref="tab-body" class="tab-body">
            <slot></slot>
        </div>
    </div>
</template>

<script>
    export default {
        name: "vde-tab-bar",
        props: {
            items: Array,
            selected: [String, Number]
        },
        mounted() {
            this.hideAll();
            if (this.selected)
                this.select(this.selected);
        },
        beforeDestroy() {

        },
        methods: {
            hideAll() {
                let elements = this.$refs['tab-body'].querySelectorAll('.tab-body > div');
                elements.forEach(x => x.style.display = 'none');
            },
            select(item) {
                this.hideAll();

                this.selectedItem = item;
                let index = this.items.indexOf(item);
                let element = this.$refs['tab-body'].querySelectorAll('.tab-body > div')[index];
                element.style.display = 'flex';
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