<template>
    <div>
        <div>
            <el-image :src="url" class="img" :fit="fitMethod">
                <div slot="error">
                    <div class="im-slot">
                        <span>请选择一张图片</span>
                    </div>
                </div>
            </el-image>
            <el-image :src="url1" class="img" :fit="fitMethod">
                <div slot="error">
                    <div class="im-slot">
                        <span>后台处理中...</span>
                    </div>
                </div>
            </el-image>
            <!-- test -->
            <!-- 蒙版 -->
            <img id="mask" ref="mask" hidden/>
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
                :auto-upload="true">
            <i class="el-icon-plus"></i>
        </el-upload>
        <div class="margin">
            <el-input v-model="inputUrl" placeholder="请输入内容">
                <el-button slot="append" @click="addUrl">添加链接</el-button>
            </el-input>
        </div>
    </div>
</template>

<script>
    import {get, post, del} from '../libs/http';
    export default {
        name: "tab-color",
        data() {
            return{
                fileList: [],
                baseUrl: 'http://172.18.167.9:9000',
                url: "",
                url1:"",
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
        mounted() {
            console.log("bokeh mounted");
        },
        methods: {
            async getImage() {
                this.url1="";
                let temp=this.url.split('/');
                let name=temp[temp.length-1];
                this.url1=this.baseUrl+"/process_bokeh/"+name;
                console.log(this.url1)
                //let res = await get('/process/'+name);
                //console.log(res);
            },
            submitUpload() {
                this.$refs.upload.submit();
            },
            async handleRemove(file, fileList) {
                console.log(file)
                let temp=file.url.split('/');
                let name=temp[temp.length-1];
                let res = await del('/delete/'+name);
                console.log(res)
            },
            handlePreview(file) {
                console.log("preview", file.url);
                this.url=file.url;
                this.getImage();
            },
            handleSuccess(response, file, fileList) {
                this.fileList.forEach(item=>{
                    if(item.uid===file.uid){
                        item.url=this.baseUrl+'/get_image/'+response.name;
                    }
                })
            },
            async addUrl() {
                let data={url: this.inputUrl};
                const loading = this.$loading({
                    lock: true,
                    text: 'Loading',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                });

                let res = await post("/upload_image", data);
                console.log(res);

                loading.close();

                if(res.data.error){
                    this.$message.error('上传失败');
                } else {
                    this.$message.success('上传成功');
                    this.fileList.push(data);
                }

            }
        }
    }
</script>

<style scoped>
    .img {
        width: 600px;
        height: 402px;
        overflow: hidden;
        margin: 50px 10px;
    }
    .im-slot {
        text-align: center;
        line-height: 400px;
        border: 1px dashed #c0ccda;
        border-radius: 6px;
    }
    .margin {
        margin: 10px;
        width: 500px;
    }
</style>
