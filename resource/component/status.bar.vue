<template>
    <div class="status-bar" style="justify-content: flex-end;">
        <div class="profile">
            <img src="https://habrastorage.org/getpro/habr/company/7e4/7b8/e31/7e47b8e31d0efe9f398461278a16a357.png" alt="Photo">
            <div class="name">{{ storage.user.name }}</div>
        </div>
        <div style="flex: 1;"></div>
        <div class="button">
            <i class="fas fa-cog"></i>
        </div>
        <div @click="logout" class="button">
            <i class="fas fa-sign-out-alt"></i>
        </div>
    </div>
</template>

<script>
    import SceneApi from "../js/scene.api";
    import DataStorage from "../js/data.storage";
    import UserApi from "../js/user.api";

    export default {
        name: "status-bar",
        props: {

        },
        mounted() {

        },
        methods: {
            logout() {
                UserApi.logout();
            }
        },
        data() {
            return {
                storage: DataStorage
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>