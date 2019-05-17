<template>
  <div id="app">
    <main-page/>
  </div>
</template>

<script>
import mainPage from './components/mainPage.vue'

export default {
  name: 'app',
  components: {
    "main-page": mainPage
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
