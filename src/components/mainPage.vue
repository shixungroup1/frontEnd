<template>
  <div class="root">
    <tabs></tabs>
  </div>
</template>

<script>
import tabs from './tabs.vue'
export default {
  name: 'mainPage',
  data() {
    return {
      message: "sjdksksd"
    }
  },
  components: {
    tabs
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
