<template>
    <div>
        <div class="tabs">
            <button v-for='tab in tabs' :key="tab.id" :class="{'is-active': tab.isActive}" @click='selectedTab(tab.id)'>
                {{tab.name}}
            </button>
            <component :is="currentTabComponent"> </component>
        </div>
        <div class='tab-detail'>
            <slot></slot>
        </div>
    </div>
</template>

<script>
import tabBokeh from './tab-bokeh.vue'
import tabCutout from './tab-cutout.vue'
import tabBarrage from './tab-barrage.vue'
export default {
    name: 'tabs',
    data() {
        return {
            currentTab: "bokeh", 
            tabs: [
                {
                    id: "bokeh",
                    name: "背景虚化",
                    isActive: true
                }, {
                    id: "cutout",
                    name: "抠图",
                    isActive: false
                }, {
                    id: "barrage",
                    name: "弹幕",
                    isActive: false
                }
            ]
        }
    },
    computed: {
        currentTabComponent: function() {
            return 'tab-' + this.currentTab.toLowerCase()
        }
    },
    methods: {
        selectedTab: function(tab) {
            this.currentTab = tab;
        }
    },
    components: {
        "tab-bokeh": tabBokeh,
        "tab-cutout": tabCutout,
        "tab-barrage": tabBarrage
    }

}
</script>

<style scoped>

</style>
