<template>
    <resizable :area="iconData">
        <div class="app-icon caption" v-on:dblclick="click" style="">
            <img :src="iconData.icon || 'https://ru.vuejs.org/images/logo.png'" alt="">
            <div>{{ iconData.title }}</div>
        </div>
    </resizable>
</template>

<script>
    import VDECore from "../js/core";

    export default {
        name: "application-icon",
        props: {
            iconData: Object
        },
        mounted() {
            console.log(this.iconData);
        },
        methods: {
            click() {
                VDECore.runApplication(this.iconData);
            }
        },
        data() {
            return {}
        }
    }
</script>

<style lang="scss" scoped>
    .app-icon {
        cursor: pointer;
        user-select: none;

        img {
            pointer-events: none;
            display: block;
            width: 100%;
            height: 100%;
        }

        div {
            text-align: center;
            margin-top: 7px;
            font-size: 12px;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
</style>