<template>
  <el-tabs v-model="currentTab">
    <el-tab-pane v-for="tab in tabs" :key="tab.id" :label="tab.label">
      <!-- <tab-barrage></tab-barrage> -->
      <component :is="currentTabComponent"> </component>
    </el-tab-pane>
  </el-tabs>
</template>
<script>
import tabBokeh from './tab-bokeh.vue'
import tabCutout from './tab-cutout.vue'
import tabBarrage from './tab-barrage.vue'
export default {
  name: "tabs", 
  data() {
    return {
      currentTab: 0, 
      tabs: [
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
  computed: {
    currentTabComponent: function() {
      console.log("currentTabComponent")
      return 'tab-' + this.tabs[this.currentTab].name.toLowerCase()
    }
  },
  components: {
    "tab-bokeh": tabBokeh,
    "tab-cutout": tabCutout,
    "tab-barrage": tabBarrage
  }
};

</script>