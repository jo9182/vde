<template>
    <div @click="isSelected = !isSelected" class="checkbox" :class="isSelected ?'selected' :''">
        <svg width="14" height="10" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M13.2526 1.86694C13.4089 2.02319 13.487 2.21292 13.487 2.43613C13.487 2.65934 13.4089 2.84908 13.2526 3.00533L7.19239 9.06558L6.05399 10.204C5.89774 10.3602 5.70801 10.4383 5.4848 10.4383C5.26158 10.4383 5.07185 10.3602 4.9156 10.204L3.77721 9.06558L0.74707 6.03544C0.59082 5.87919 0.512695 5.68946 0.512695 5.46625C0.512695 5.24303 0.59082 5.0533 0.74707 4.89705L1.88547 3.75866C2.04172 3.60241 2.23145 3.52428 2.45466 3.52428C2.67787 3.52428 2.86761 3.60241 3.02386 3.75866L5.4848 6.22797L10.9758 0.728516C11.1321 0.572266 11.3218 0.494141 11.545 0.494141C11.7683 0.494141 11.958 0.572266 12.1142 0.728516L13.2526 1.86694Z" fill="white"/>
        </svg>
    </div>
</template>

<script>
    export default {
        name: "vde-checkbox",
        props: {
            selected: Boolean
        },
        mounted() {
            this.isSelected = this.selected;
        },
        methods: {

        },
        data() {
            return {
                isSelected: false
            }
        }
    }
</script>

<style lang="scss" scoped>
    .checkbox {
        cursor: pointer;
        width: 18px;
        height: 18px;
        background: #1bbbf9;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        user-select: none;
        transition: opacity, 0.2s;

        &:hover {
            opacity: 0.8;
        }

        &:active {
            position: relative;
            opacity: 0.5;
            top: 1px;
        }

        svg {
            transition: opacity, rotate, scale, 0.3s;
            display: block;
            opacity: 0;
            transform: rotate(45deg) scale(2);
        }
    }

    .checkbox.selected {
        svg {
            opacity: 1;
            transform: rotate(0deg) scale(1);
        }
    }
</style>