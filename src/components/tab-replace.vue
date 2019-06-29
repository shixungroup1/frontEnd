<template>
    <div>
        <div class="class1">
            <div class="class2">
                <el-image :src="foreUrl" class="img" :fit="fitMethod">
                    <div slot="error">
                        <div class="im-slot">
                            <span>请选择前景图片</span>
                        </div>
                    </div>
                </el-image>
                <el-image :src="bgUrl" class="img" :fit="fitMethod">
                    <div slot="error">
                        <div class="im-slot">
                            <span>请选择背景图片</span>
                        </div>
                    </div>
                </el-image>
            </div>
            <el-image :src="url1" class="img" :fit="fitMethod">
                <div slot="error">
                    <div class="im-slot">
                        <span>后台处理中...</span>
                    </div>
                </div>
            </el-image>
        </div>
        <p>前景图片</p>
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

        <p>背景图片</p>
        <el-upload
                class="upload-demo"
                ref="upload1"
                action="http://172.18.167.9:9000/upload_bg"
                :on-preview="handlePreview1"
                :on-remove="handleRemove1"
                :file-list="fileList1"
                :on-success="handleSuccess1"
                list-type="picture-card"
                :auto-upload="true">
            <i class="el-icon-plus"></i>
        </el-upload>
        <div class="margin">
            <el-input v-model="inputUrl1" placeholder="请输入内容">
                <el-button slot="append" @click="addUrl1">添加链接</el-button>
            </el-input>
        </div>
    </div>
</template>

<script>
    import {get, post, del} from '../libs/http';
    export default {
        name: "tab-replace",
        data() {
            return{
                fileList: [],
                fileList1: [],
                baseUrl: 'http://172.18.167.9:9000',
                foreUrl: "",
                bgUrl: "",
                url1:"",
                fitMethod: 'contain',
                inputUrl: '',
                inputUrl1: ''
            }

        },
        created: async function () {
            let res = await get('/list_images');
            let form = res.data.data;
            form.forEach((item)=>{
                let temp = item.split('/');
                let name = temp[temp.length-1];
                this.fileList.push({name:name, url:item});
            });

            let res1 = await get('/list_background');
            let form1 = res1.data.data;
            form1.forEach((item)=>{
                let temp = item.split('/');
                let name = temp[temp.length-1];
                this.fileList1.push({name:name, url:item});
            })

        },
        methods: {
            async getImage() {
                this.url1="";
                let temp=this.foreUrl.split('/');
                let name=temp[temp.length-1];
                console.log(name,"fore name")
                this.url1=this.baseUrl+"/process_replace/"+name+"?t=" + Math.random();
            },
            submitUpload() {
                this.$refs.upload.submit();
            },
            async handleRemove(file, fileList) {
                let temp=file.url.split('/');
                let name=temp[temp.length-1];
                await del('/delete/'+name);
            },
            async handleRemove1(file, fileList) {
                let temp=file.url.split('/');
                let name=temp[temp.length-1];
                await del('/delete_bg/'+name);
            },
            handlePreview(file) {
                this.foreUrl=file.url;
                if(this.bgUrl!==""){
                    this.getImage();
                }
            },
            async handlePreview1(file) {
                // console.log("preview", file);
                this.bgUrl=file.url;
                let temp=this.bgUrl.split('/');
                let name=temp[temp.length-1];
                console.log(name,"bg name")
                let res = await get('/get_background/'+ name);
                if(this.foreUrl!==""){
                    this.getImage();
                }

            },
            handleSuccess(response, file, fileList) {
                this.fileList.forEach(item=>{
                    if(item.uid===file.uid){
                        item.url=this.baseUrl+'/get_image/'+response.name;
                    }
                })
            },
            handleSuccess1(response, file, fileList) {
                this.fileList1.forEach(item=>{
                    if(item.uid===file.uid){
                        item.url=this.baseUrl+'/get_image/'+response.name;
                    }
                })
            },
            async addUrl() {
                let data={url:this.inputUrl};
                let res = await post("/upload_image", data);
                console.log(res);
                this.fileList.push(data);
            },
            async addUrl1() {
                let data={url:this.inputUrl};
                const loading = this.$loading({
                    lock: true,
                    text: 'Loading',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                });

                let res = await post("/upload_bg", data);
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
        margin: 10px 10px;
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
    .class1 {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .class2 {
        display: flex;
        flex-direction: column;
    }
</style>

