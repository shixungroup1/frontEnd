<template>
    <div>
        <!-- <el-dropdown> -->
        <div class="#button-container">
            <el-button type="primary" id="imageButton" @click.native="changeOption('image')">
                image
            </el-button>
        
            <el-button type="primary" id="videoButton" @click.native="changeOption('video')">
                video
            </el-button>
        </div>
        <component :is="optionID" :file-list="fileList" @update="handleUpdate"></component>
    </div>
</template>

<script>
import videoBarrage from './barrages/barrage-video.vue';
import imageBarrage from './barrages/barrage-image.vue';
export default {
    name: "tabBarrage",
    props: {
        fileList: Array
    },
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
            this.option = choice;
            console.log("change option" + this.fileList);
        },
        handleUpdate(fileList) {
            this.fileList = fileList
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
