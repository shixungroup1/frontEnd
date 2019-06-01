<template>
    <div>
        <el-dropdown>
            <el-button type="primary">
                {{ option }}<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="changeOption('video')">Video</el-dropdown-item>
                <el-dropdown-item @click.native="changeOption('image')">Image</el-dropdown-item>
            </el-dropdown-menu>
        </el-dropdown>
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
            console.log("this.option " + this.option);
        }
    }
}
</script>

<style scoped>
</style>