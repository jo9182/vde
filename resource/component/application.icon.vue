<template>
    <resizable :area="iconData">
        <div class="caption" v-on:dblclick="click" style="cursor: pointer;user-select: none;">
            <img src="https://ru.vuejs.org/images/logo.png" alt="" style="pointer-events: none;display: block;width: 100%; height: 100%">
            <div style="text-align: center;">{{ iconData.title }}</div>
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