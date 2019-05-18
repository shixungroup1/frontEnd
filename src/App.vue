<template>
  <div id="app">
    <main-page></main-page>
  </div>
</template>

<script>
import mainPage from './components/mainPage.vue'

export default {
  name: 'app',
  components: {
    'main-page': mainPage
  }
}
</script>
