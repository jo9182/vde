<template>
    <div class="vde-table">
        <div class="header">
            <div v-for="(x, i) in headerTitle" @click="sortBy(x, headerType[i])" :style="{ flex: headerColumnWidth[i] }">{{ x }}</div>
        </div>
        <div class="body">
            <div v-for="(x, i) in currentData" @click.stop="$emit('select', x)">
                <div @click="[editable ?edit(i, j) :'']" v-for="(y, j) in headerTitle" :style="{ flex: headerColumnWidth[j] }">
                    <span v-if="!isEditable(i, j)" v-html="headerFormat[j](x[y], x)"></span>
                    <vde-input ref="currentEditField" v-if="isEditable(i, j)" :value="x[y]" @change="update(x, y, $event)" style="width: 100%;"></vde-input>
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

            this.refresh(this.header, this.data);
        },
        beforeDestroy() {

        },
        methods: {
            sortBy(x, type = 'string') {
                if (type === 'int') {
                    this.currentData = this.data.sort((a, b) => {
                        return a[x] - b[x];
                    });
                } else {
                    this.currentData = this.data.sort((a, b) => {
                        return (a[x] + '').localeCompare(b[x] + '');
                    });
                }
                if (this.isSortOrderAsc) this.currentData.reverse();

                this.isSortOrderAsc = !this.isSortOrderAsc;
            },
            update(row, column, value) {
                let index = this.headerTitle.findIndex(x => x === column);
                if (this.headerType[index] === 'int') value *= 1;
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
                        this.$refs.currentEditField[0].focus();
                        this.$refs.currentEditField[0].select();
                    }
                });
            },
            refresh(header = null, data = null) {
                if (data) this.currentData = data;
                if (header) {
                    this.headerTitle = header.map(x => {
                        if (typeof x === "string") return x.split(':')[0];
                        return x.title.split(':')[0];
                    });
                    this.headerType = header.map(x => {
                        if (typeof x === "string") return x.split(':')[1] || 'string';
                        return x.title.split(':')[1] || 'string';
                    });
                    this.headerColumnWidth = header.map(x => {
                        if (typeof x === "string") return 1;
                        return x.columnWidth || 1;
                    });
                    this.headerFormat = header.map(x => {
                        if (typeof x === "string") return (y) => y;
                        return x.format ?x.format :(y) => y;
                    });
                }
            }
        },
        watch: {
            data(val) {
                this.refresh(null, val);
            },
            header(val) {
                this.refresh(val, null);
            }
        },
        data() {
            return {
                row: -1,
                column: -1,
                isSortOrderAsc: false,
                headerTitle: [],
                headerType: [],
                headerFormat: [],
                headerColumnWidth: [],
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
        border-radius: 3px;
        border: 1px solid #282828;
        overflow: hidden;

        .header {
            display: flex;
            background: #4b4b4b;
            color: #bbbbbb;
            border-bottom: 1px solid #303030;

            > div {
                flex: 1;
                padding: 5px 10px;
                cursor: pointer;
                user-select: none;
                text-transform: capitalize;
                border-right: 1px solid #303030;
            }

            > div:last-child {
                border-right: 0;
            }
        }

        .body {
            display: flex;
            flex-direction: column;

            > div {
                display: flex;
                flex: 1;
                cursor: pointer;
                background: #404040;
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
                // background: #565656;
            }
        }
    }
</style>