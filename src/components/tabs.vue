<template>
    <div>
        <el-tabs v-model="currentTab" :tab-position="tabPosition" class="page">
            <el-tab-pane label="分析结果">
                <tab-sa class="page"/>
            </el-tab-pane>

            <el-tab-pane label="抠图">
                <tab-cutout class="page"/>
            </el-tab-pane>

            <el-tab-pane label="虚化">
                <tab-bokeh class="page"/>
            </el-tab-pane>

            <el-tab-pane label="色彩">
                <tab-color class="page"/>
            </el-tab-pane>

            <el-tab-pane label="背景替换">
                <tab-replace class="page"/>
            </el-tab-pane>

            <el-tab-pane label="弹幕">
                <tab-barrage class="page"/>
            </el-tab-pane>
        </el-tabs>

    </div>
</template>
<script>
    import tabBokeh from './tab-bokeh.vue'
    import tabCutout from './tab-cutout.vue'
    import tabBarrage from './tab-barrage.vue'
    import tabSA from './tab-sa.vue'
    import tabReplace from './tab-replace'
    import tabColor from './tab-color'
    import {get, post, del} from '../libs/http';

    export default {
        name: "tabs",
        data() {
            return {
                currentTab: "0",
                tabPosition: 'top',
                fileList: [],
                tabs: [
                    {
                        id: 4,
                        name: "sa",
                        label: "显著性分析",
                        isActive: false
                    },
                    {
                        id: 0,
                        name: "bokeh",
                        label: "背景虚化",
                        isActive: true
                    }, {
                        id: 1,
                        name: "cutout",
                        label: "抠图",
                        isActive: false
                    }, {
                        id: 2,
                        name: "barrage",
                        label: "弹幕",
                        isActive: false
                    }
                ]
            };
        },
        created: async function () {
            let res = await get('/list_images');
            let form = res.data.data;
            form.forEach((item)=>{
                let temp = item.split('/');
                let name = temp[temp.length-1];
                this.fileList.push({name:name, url:item});
            })
        },
        computed: {
            currentTabComponent: function () {
                return 'tab-' + this.tabs[this.currentTab].name.toLowerCase()
            }
        },
        components: {
            "tab-bokeh": tabBokeh,
            "tab-cutout": tabCutout,
            "tab-barrage": tabBarrage,
            "tab-sa": tabSA,
            "tab-replace": tabReplace,
            "tab-color": tabColor
        }
    };

</script>

<style scoped>
    .page {
        display: flex;
        flex-direction: column;
        justify-content: center;
        margin-left: 10px;
        align-items: center;
    }
</style>
