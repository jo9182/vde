<template>
    <div class="table">
        <div class="header">
            <div v-for="x in header">{{ x }}</div>
        </div>
        <div class="body">
            <div v-for="x in data">
                <div v-for="y in header">{{ x[y] }}</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "vde-table",
        props: {
            header: Array,
            data: Array
        },
        mounted() {

        },
        beforeDestroy() {

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
    .table {
        .header {
            display: flex;
        }

        .body {
            display: flex;
        }
    }
</style>