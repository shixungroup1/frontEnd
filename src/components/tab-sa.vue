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
            <el-image :src="url1" class="img" :fit="fitMethod" v-loading="loading"
                      element-loading-text="后台处理中..."
                      element-loading-spinner="el-icon-loading"
                      element-loading-background="rgba(0, 0, 0, 0.8)" @load="handleLoad">
                <div slot="error">
                    <div class="im-slot">
                        <span>这里将会显示处理完成的图片</span>
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
        name: "tabSA",
        props: {
            fileList: Array
        },
        data() {
            return{
                baseUrl: 'http://172.18.167.9:9000',
                loading: false,
                url: "",
                url1:"",
                fitMethod: 'contain',
                inputUrl: ''
            }

        },
        methods: {
            async getImage() {
                this.loading=true;
                this.url1="";
                let temp=this.url.split('/');
                let name=temp[temp.length-1];
                this.url1=this.baseUrl+"/process_sa/"+name;
            },
            handleLoad() {
                this.loading=false;
            },
            async handleRemove(file, fileList) {
                let temp=file.url.split('/');
                let name=temp[temp.length-1];
                let res = await del('/delete/'+name);
                console.log(res)
                this.$emit('update', fileList)
            },
            handlePreview(file) {
                console.log("preview", file);
                this.url=file.url;
                this.getImage();
            },
            handleSuccess(response, file, fileList) {
                fileList.forEach(item=>{
                    if(item.uid===file.uid){
                        item.url=this.baseUrl+'/get_image/'+response.name;
                    }
                });
                this.$emit('update', fileList)
            },
            async addUrl() {
                let data={url: this.inputUrl};
                const loading = this.$loading({
                    lock: true,
                    text: '上传中...',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                });

                let res = await post("/upload_image", data);

                loading.close();

                if(res.data.error){
                    console.log(res.data)
                    this.$message.error('上传失败');
                } else {
                    this.$message.success('上传成功');
                    data.url = this.baseUrl + '/get_image/' + res.data.name;
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
