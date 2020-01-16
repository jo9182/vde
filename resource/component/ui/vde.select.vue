<template>
    <div class="vde-select">
        <div @click.stop="toggle" ref="input" class="input">
            <span style="margin-right: 5px;">{{ selectedItem || 'Select...' }}</span>
            <svg width="10" height="8" viewBox="0 0 15 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M14.0632 0.879744C14.1525 0.96903 14.1971 1.07171 14.1971 1.18778C14.1971 1.30385 14.1525 1.40653 14.0632 1.49582L7.82213 7.73689C7.73284 7.82617 7.63016 7.87082 7.51409 7.87082C7.39802 7.87082 7.29534 7.82617 7.20606 7.73689L0.964983 1.49582C0.875698 1.40653 0.831055 1.30385 0.831055 1.18778C0.831055 1.07171 0.875698 0.96903 0.964983 0.879744L1.63463 0.210101C1.72391 0.120815 1.82659 0.0761719 1.94266 0.0761719C2.05873 0.0761719 2.16141 0.120815 2.2507 0.210101L7.51409 5.47349L12.7775 0.210101C12.8668 0.120815 12.9694 0.0761719 13.0855 0.0761719C13.2016 0.0761719 13.3043 0.120815 13.3936 0.210101L14.0632 0.879744Z" fill="#bbbbbb"/>
            </svg>
        </div>
        <div v-if="isShow" class="list" style="z-index: 1;" :style="{ width }">
            <div v-for="x in items" @click="[selectedItem = x.split(':').shift(), $emit('change', x.split(':').pop())]">{{ x.split(':')[0] }}</div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "vde-select",
        props: {
            items: Array,
            value: String
        },
        mounted() {
            document.addEventListener('click', () => {
                this.isShow = false;
            });
        },
        beforeDestroy() {

        },
        model: {
            prop: 'value',
            event: 'change',
        },
        methods: {
            toggle() {
                this.isShow = !this.isShow;
                this.width = this.$refs.input.getBoundingClientRect().width + 'px';
            }
        },
        watch: {
            model(val) {
                this.selectedItem = val;
                console.log(1);
            }
        },
        data() {
            return {
                width: 'auto',
                isShow: false,
                selectedItem: null
            }
        }
    }
</script>

<style lang="scss" scoped>
    .vde-select {
        font-size: 12px;
        flex: 1;

        .input {
            background: #4b4b4b;
            padding: 5px;
            border-radius: 2px;
            cursor: pointer;
            display: flex;
            color: #bbbbbb;
            border: 1px solid transparent;
            box-shadow: 0 1px 1px 0 #0a0a0a;
            transition: background-color, 0.2s;

            &:hover {
                background: #5b5b5b;
            }

            &:active {
                background: #6b6b6b;
            }

            svg {
                margin-left: auto;
                align-self: center;
            }
        }

        .list {
            position: absolute;
            background: #121212;
            max-height: 180px;
            overflow-y: scroll;

            > div {
                cursor: pointer;
                padding: 5px;
                user-select: none;
                background: #4b4b4b;
                border-bottom: 1px solid #5d5d5d;
                font-size: 12px;
                color: #bbbbbb;

                &:hover {
                    opacity: 0.8;
                }
            }

            // Scrollbar firefox
            scrollbar-color: #b2b2b2 #dddddd;

            // Scrollbar webkit
            &::-webkit-scrollbar {
                background: #5d5d5d;
                width: 4px;
            }

            &::-webkit-scrollbar-thumb {
                background: #121212;
            }
        }
    }
</style>