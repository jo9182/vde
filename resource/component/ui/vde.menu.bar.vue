<template>
    <div class="vde-menu-bar">
        <div class="item-list" >
            <div ref="menu-item-1" v-for="(x, i) in items" @click="[x.click ?x.click.call(context) :null, hideAll()]" @mouseover.stop="showItems(x, i)">
                {{ x.title }}
            </div>
        </div>
        <div v-if="currentItems1" class="sub-menu" :style="{ left: `${subMenuPositionX1}px` }">
            <div ref="menu-item-2" v-for="(x, i) in currentItems1" @click="[x.click ?x.click.call(context) :null, hideAll()]" @mouseover.stop="showItems(x, i, 2)" style="display: flex;">
                <span style="margin-right: 15px;">{{ x.title }}</span>
                <i v-if="x.items" class="fas fa-caret-right" style="margin-left: auto;"></i>
            </div>
        </div>
        <div v-if="currentItems2" class="sub-menu" :style="{ left: `${subMenuPositionX2}px`, top: `${subMenuPositionY2}px` }">
            <div v-for="x in currentItems2" @mouseover.stop="" @click="[x.click ?x.click.call(context) :null, hideAll()]">{{ x.title }}</div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "vde-menu-bar",
        props: {
            items: Array,
            context: Object
        },
        mounted() {
            this.documentListenerMouserOver = () => {
                this.currentItems1 = null;
                this.currentItems2 = null;
            };
            document.addEventListener('mouseover', this.documentListenerMouserOver);
        },
        beforeDestroy() {
            document.removeEventListener('mouseover', this.documentListenerMouserOver);
        },
        methods: {
            showItems(x, id, subMenu = 1) {
                if (subMenu === 1) this.currentItems2 = null;
                this['currentItems' + subMenu] = x.items;

                if (subMenu > 1) {
                    this['subMenuPositionX' + subMenu] = this.$refs['menu-item-' + subMenu][id].getBoundingClientRect().left +
                        this.$refs['menu-item-' + subMenu][id].getBoundingClientRect().width;

                    this['subMenuPositionY' + subMenu] = this.$refs['menu-item-' + subMenu][id].getBoundingClientRect().top;
                } else {
                    this['subMenuPositionX' + subMenu] = this.$refs['menu-item-' + subMenu][id].getBoundingClientRect().left;
                }
            },
            hideAll() {
                this.currentItems1 = null;
                this.currentItems2 = null;
            }
        },
        data() {
            return {
                subMenuPositionX1: 0,
                subMenuPositionX2: 0,
                subMenuPositionY2: 0,
                currentItems1: null,
                currentItems2: null,
                documentListenerMouserOver: null
            }
        }
    }
</script>

<style lang="scss" scoped>
    .vde-menu-bar {
        user-select: none;
        background: #4b4b4b;

        .item-list {
            display: flex;

            > div {
                padding: 5px 15px;
                background: #4b4b4b;
                font-size: 12px;
                cursor: pointer;

                &:hover {
                    background: #404040;
                }

                &:active {
                    background: #404040;
                }
            }
        }

        .sub-menu {
            position: absolute;
            z-index: 1;

            > div {
                font-size: 12px;
                padding: 5px 14px;
                background: #585858;
                cursor: pointer;

                &:hover {
                    background: #404040;
                }

                &:active {
                    background: #404040;
                }
            }
        }
    }
</style>