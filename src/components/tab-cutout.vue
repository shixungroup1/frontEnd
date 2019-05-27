<template>
    <div>
        <p>This is Cutout</p>
        <div>
            <el-image :src="url" class="img" :fit="fitMethod">
                <div slot="error">
                    <div class="im-slot">
                        <span>请选择一张图片</span>
                    </div>

                </div>
            </el-image>
        </div>
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
            <el-button size="small" type="success" @click="submitUpload">上传到服务器</el-button>
        </div>
        <div slot="tip" class="margin el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>

        <div>
            <el-button size="small" type="primary">下载图片</el-button>
        </div>

        <div>
            <el-image :src="url1" class="img" :fit="fitMethod">
                <div slot="error">
                    <div class="im-slot">
                        <span>后台处理中...</span>
                    </div>
                </div>
            </el-image>
        </div>
    </div>
</template>

<script>
    import {get, post} from '../libs/http';
    export default {
        name: "tabCutout",
        data() {
            return{
                fileList: [
                    {name: 'food.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'},
                    {name: 'food2.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'}
                ],
                url: "",
                url1:"",
                fitMethod: 'contain'
            }

        },
        methods: {
            async getImage() {
                let data={};
                let res = await get('/get',data);
                console.log(res)
            },
            submitUpload() {
                this.$refs.upload.submit();
            },
            handleRemove(file, fileList) {
                console.log(file, fileList);
            },
            handlePreview(file) {
                console.log(file);
                this.url=file.url;
            }
        }

    }
</script>

<style scoped>
    .img {
        width: 400px;
        height: 302px;
        overflow: hidden;
        margin: 10px;
    }
    .im-slot {
        text-align: center;
        line-height: 300px;
        border: 1px dashed #c0ccda;
        border-radius: 6px;
    }
    .margin {
        margin: 10px;
    }
</style>
