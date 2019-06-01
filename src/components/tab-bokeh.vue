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
                action="http://172.18.167.9:9000/upload_image"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :file-list="fileList"
                :on-success="handleSuccess"
                list-type="picture-card"
                :auto-upload="false">
            <i class="el-icon-plus"></i>
        </el-upload>
        <div>
            <el-button size="small" type="success" @click="submitUpload">上传到服务器</el-button>
        </div>
        <div class="margin">
            <el-input v-model="inputUrl" placeholder="请输入内容">
                <el-button slot="append" @click="addUrl">添加链接</el-button>
            </el-input>
        </div>

        <div>
            <el-button size="small" type="primary" @click="getImage">下载图片</el-button>
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
        name: "tabBokeh",
        data() {
            return{
                fileList: [
                    {name: 'food.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'},
                    {name: 'food2.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'}
                ],
                baseUrl: 'http://172.18.167.9:9000/upload_image',
                url: "",
                url1:"http://172.18.167.9:9000/download/2019052515555794.jpeg",
                fitMethod: 'contain',
                inputUrl: ''
            }

        },
        created: async function () {
            let res = await get('/list_images');
            let form = res.data.data;
            form.forEach((item)=>{
                let temp = item.split('/');
                let name = temp[temp.length-1];
                this.fileList.push({name:name, url:item});
            })

        },
        methods: {
            async getImage() {

            },
            submitUpload() {
                this.$refs.upload.submit();
            },
            handleRemove(file, fileList) {
                console.log(file, fileList);
            },
            handlePreview(file) {
                console.log("preview", file);
                this.url=file.url;
            },
            handleSuccess(response, file, fileList) {
                console.log(response)
            },
            async addUrl() {
                let data={url:this.inputUrl};
                let res = await post("/upload_image", data);
                console.log(res);
                this.fileList.push(data);
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
