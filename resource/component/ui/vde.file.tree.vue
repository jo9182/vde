<template>
    <vde-tree :data="fileTree" :selected="[]" v-on:select="$emit('select', $event)"></vde-tree>
</template>

<script>
    export default {
        name: "vde-file-tree",
        props: {
            path: String,
            location: String,
            filter: String
        },
        async mounted() {
            this.fileTree = await VDE.getFileTree(this.path || '/', this.location || 'docs', this.filter || '.*');
            console.log(this.fileTree);
        },
        beforeDestroy() {

        },
        methods: {

        },
        data() {
            return {
                fileTree: []
            }
        }
    }
</script>

<style lang="scss" scoped>
    .vde-tree {

    }
</style>