<template>
    <div>
        <div class="vde-tab-bar">
            <div class="toggle-group button-group">
                <!--<button @click="select(item)" class="button base" :class="item === selectedItem ?'selected' :''" v-for="item in items">{{ item }}</button>-->
                <vde-button @click="select(item)" v-for="item in items" :title="item" :selected="item === selectedItem" style="white-space: nowrap;"></vde-button>
            </div>
            <div ref="tab-body" class="tab-body">
                <slot></slot>
            </div>
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
    .vde-tab-bar {
        position: relative;
        border: 1px solid #4b4b4b;
        border-radius: 2px;
        padding: 0 10px 10px;
        margin-top: 20px;
        display: flex;
        flex-direction: column;

        .toggle-group {
            position: relative;
            top: -12px;
            align-self: center;
        }
    }
</style>