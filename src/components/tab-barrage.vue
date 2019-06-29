<template>
    <div>
        <!-- <el-dropdown> -->
        <div class="#button-container">
            <el-button type="" id="imageButton" @click.native="changeOption('image')">
                image
            </el-button>
        
            <el-button type="primary" id="videoButton" @click.native="changeOption('video')">
                video
            </el-button>
        </div>
        <component :is="optionID"></component>
    </div>
</template>

<script>
import videoBarrage from './barrages/barrage-video.vue';
import imageBarrage from './barrages/barrage-image.vue';
export default {
    name: "tabBarrage",
    data() {
        return {
            option: "image"
        }
    },
    computed: {
        optionID: function() {
            return 'barrage-' + this.option;
        }
    },
    components: {
        "barrage-video": videoBarrage,
        "barrage-image": imageBarrage
    },
    methods: {
        changeOption: function(choice) {
            this.option = choice
        }
    }
}
</script>

<style scoped>
.button-container {
    height: auto;
}
#videoButton {
    position: relative;
    margin: 10px;
    float: right;
}

#imageButton {
    position: relative;
    float: left;
    margin: 10px;
}
</style>
