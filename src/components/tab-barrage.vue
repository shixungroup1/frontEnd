<template>
    <div>
        <video-barrage></video-barrage>
        <image-barrage></image-barrage>
    </div>
</template>

<script>
import videoBarrage from './barrages/barrage-video.vue';
import imageBarrage from './barrages/barrage-image.vue';
export default {
    name: "tabBarrage",
    components: {
        "video-barrage": videoBarrage,
        "image-barrage": imageBarrage
    }
}
</script>

<style scoped>


</style>
