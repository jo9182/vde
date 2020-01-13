<template>
    <div class="vde-table">
        <div class="header">
            <div v-for="x in header" @click="sortBy(x)">{{ x }}</div>
        </div>
        <div class="body">
            <div v-for="(x, i) in currentData" @click.stop="$emit('select', x)">
                <div @click="[editable ?edit(i, j) :'']" v-for="(y, j) in header">
                    <span v-if="!isEditable(i, j)">{{ x[y] }}</span>
                    <vde-input ref="currentEditField" v-if="isEditable(i, j)" :value="x[y]" @change="update(x, y, $event.target.value)" style="width: 100%;"></vde-input>
                </div>
            </div>
            <vde-button v-if="editable" @click="add()" :title="'add'" style="margin-top: 5px;"></vde-button>
        </div>
    </div>
</template>

<script>
    export default {
        name: "vde-table",
        props: {
            header: Array,
            data: Array,
            editable: Boolean
        },
        mounted() {
            document.addEventListener('click', () => {
                if (this.editable) this.edit(-1, -1);
            });

            this.currentData = this.data;
        },
        beforeDestroy() {

        },
        methods: {
            sortBy(x) {
                this.currentData = this.data.sort((a, b) => {
                    return (a[x] + '').localeCompare(b[x] + '');
                });
                if (this.isSortOrderAsc) this.currentData.reverse();

                this.isSortOrderAsc = !this.isSortOrderAsc;
            },
            update(row, column, value) {
                row[column] = value;
                this.edit(-1, -1);
            },
            add() {
                let rowData = {};
                for (let i = 0; i < this.header.length; i++) rowData[this.header[i]] = null;
                this.data.push(rowData);
            },
            isEditable(row, column) {
                return this.row === row && this.column === column;
            },
            edit(row, column) {
                this.row = row;
                this.column = column;
                this.$nextTick(() => {
                    if (this.$refs.currentEditField && this.$refs.currentEditField[0]) {
                        this.$refs.currentEditField[0].$el.focus();
                        this.$refs.currentEditField[0].$el.select();
                    }
                });
            }
        },
        watch: {
            data(val) {
                this.currentData = val;
            }
        },
        data() {
            return {
                row: -1,
                column: -1,
                isSortOrderAsc: false,
                currentData: []
            }
        }
    }
</script>

<style lang="scss" scoped>
    .vde-table {
        display: flex;
        flex-direction: column;
        font-size: 12px;

        .header {
            display: flex;
            background: #4b4b4b;
            color: #bbbbbb;

            > div {
                flex: 1;
                padding: 5px 10px;
                cursor: pointer;
                user-select: none;
            }
        }

        .body {
            display: flex;
            flex-direction: column;

            > div {
                display: flex;
                flex: 1;
                cursor: pointer;
                background: #646464;
                color: #bbbbbb;

                &:hover {
                    opacity: 0.8;
                    // background: #fe0000;
                }

                > div {
                    flex: 1;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    padding: 5px 10px;
                }
            }

            > div:nth-child(2n) {
                background: #565656;
            }
        }
    }
</style>