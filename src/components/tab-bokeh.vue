<template>
    <div>
        <p>This is Bokeh</p>

        <el-upload
                class="upload-demo"
                ref="upload"
                action="https://jsonplaceholder.typicode.com/posts/"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :file-list="fileList"
                list-type="picture-card"
                :auto-upload="false">
            <i class="el-icon-plus"></i>

        </el-upload>
        <div>
            <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
        </div>
    </div>
</template>

<script>
    import {get, post} from '../libs/http';
    export default {
        name: "tabBokeh",
        data() {
            return{
                fileList: [
                    {name: 'food.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'},
                    {name: 'food2.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'}
                ]
            }

        },
        methods: {
            async getImage() {
                let data={};
                let res = await get('/get',data);
                console.log(res)
            },
            submitUpload() {
                console.log('d')
                this.$refs.upload.submit();
            },
            handleRemove(file, fileList) {
                console.log(file, fileList);
            },
            handlePreview(file) {
                console.log(file);
            }
        }

    }
</script>

<style scoped>

</style>
