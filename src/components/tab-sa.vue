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
        methods: {
            async getImage() {
                this.url1="";
                let temp=this.url.split('/');
                let name=temp[temp.length-1];
                this.url1=this.baseUrl+"/process_sa/"+name;
            },
            async handleRemove(file, fileList) {
                let temp=file.url.split('/');
                let name=temp[temp.length-1];
                let res = await del('/delete/'+name);
                console.log(res)
            },
            handlePreview(file) {
                console.log("preview", file);
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
