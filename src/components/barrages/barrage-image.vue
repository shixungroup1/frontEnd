<template>
    <div class="outline">
        <h2>图像弹幕</h2>
        <div id="container" ref="container" >
            <img :src="currentImg" id="oriImg" ref="oriImg" @load="loadImage"/>
        </div>
        <!-- 蒙版 -->
        <img :src="currentMask" id="mask" ref="mask" hidden/>
        <!-- 发送弹幕模块 -->
        <div class="sending" ref="sendingFrame">
            <div class="inputFrame">
                <el-input v-model="input" placeholder="请输入内容"></el-input>
            </div>
            <div class="buttonFrame">
                <el-button type="primary" round @click="sendBarrage">发送</el-button>
            </div>
        </div>
        <!-- 播放演示弹幕 -->
        <div class="example">
            <el-button type="primary" round @click="playBarrage">重播演示弹幕</el-button>
        </div>
        <!-- 选择图片 -->
        <div>
            <!-- 选择上传 -->
            <el-upload
                class="upload-demo"
                ref="upload"
                action="http://172.18.167.9:9000/upload_image"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :file-list="imgList"
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
    </div>
    
</template>

<script>

import Barrage from 'barrage-ui';
import data from '../../plugins/utils/mockData.js';
import {get, post, del} from '../../libs/http';
export default {
    name: "tabBarrage",
    data() {
        return {
            container: null,
            oriImg: null,
            vCanvas: null,
            vContext: null,
            input: "样例弹幕",
            mask: null,
            height: 0,
            width: 0,
            currentTime: null,
            time: null,
            // 选择图片相关
            imgList: [
                // {
                    // name: 'bird.png',
                    // url: require('./origin.jpg')
                // }
            ],
            currentImg: "",
            currentMask: "../../../public/Masks/mask.png",
            url1:"",
            fitMethod: 'crop',
            inputUrl: ""
        }
    },
    // 从后端加载图像列表
    created: async function () {
        let res = await get('/list_images');
        let form = res.data.data;
        form.forEach((item)=>{
            let temp = item.split('/');
            let name = temp[temp.length-1];
            this.imgList.push({name:name, url:item});
        })
    },
    mounted() {
        // 处理时间，用于控制弹幕播放进度
        this.time = new Date();
        this.currentTime = this.time.getTime();
        // 初始化默认图片
        this.currentImg = "";
        this.currentMask = require("../../../public/Masks/mask.png");
        this.container = this.$refs.container;
    },
    methods: {
        loadImage: function () {
            // console.log("load img");
            this.finishLoadingImg = true;
            this.oriImg = this.$refs.oriImg;
            // console.log("origin Image 的宽和高 " + this.oriImg.height + " " + this.oriImg.width)
            this.container = this.$refs.container;
            this.mask = this.$refs.mask;
            // 设置宽高
            this.container.style.height = this.oriImg.height +'px';
            this.container.style.width = this.oriImg.width +'px';
            this.$refs.sendingFrame.style.width = this.oriImg.width +'px';
            // console.log("container的宽和高 " + this.container.style.height + " " + this.container.style.width)
            // 设置弹幕
            this.barrage = new Barrage({container: this.container});

            // 装载弹幕数据
            this.barrage.setData(data);
            this.barrage.canvas.height = this.oriImg.height;
            this.getImages();
            this.computeImgMask();
            this.barrage.play();
        },
        // 获取图像
        getImages: function() {
            this.vCanvas = document.createElement('canvas');
            this.vCanvas.width = this.oriImg.width;
            this.vCanvas.height = this.oriImg.height;
            this.vContext = this.vCanvas.getContext('2d');
            this.barrage.afterRender = () => {
                var that = this;
                this.$refs.mask.onload = function () {
                    that.vContext.drawImage(that.mask, 0, 0, that.oriImg.width, that.oriImg.height);
                };
            }
                
        },
        // 计算蒙版，即哪些地方需要透明
        computeImgMask: function() {
            // 在弹幕动画的每一帧图像渲染前计算出蒙版图像
            this.barrage.beforeRender = () => {
                const frame = this.vContext.getImageData(0, 0, this.oriImg.width, this.oriImg.height);
                const pxCount = frame.data.length / 4;
                // 构造图像蒙版，todo: 读取模型结果的图像而不是视频帧
                for(let i = 0; i < pxCount; i++) {
                    const r = frame.data[i*4+0];
                    const g = frame.data[i*4+1];
                    const b = frame.data[i*4+2];
                    // 将黑色区域以外内容设为透明
                    if(r > 128 || g > 128 || b > 128) {
                        frame.data[4*i + 3] = 0;
                    }
                }                
                // 使用蒙版
                this.barrage.setMask(frame); 
            }            
        },
        // 使得视频和图像协同操作
        playBarrage: function() {
            this.barrage.replay();
            this.time = new Date();
            this.currentTime = this.time.getTime();
        },
        // 发送弹幕
        sendBarrage: function() {
            this.time = new Date();
            const success = this.barrage.add({
                time: this.time.getTime() - this.currentTime, // 弹幕出现的时间(单位：毫秒)
                text: this.input
            });
            if(success) {
                this.input=""
                this.$message({
                    type: 'info',
                    message: `弹幕发送成功`
                });
            } else {
                // 弹窗提示失败
                this.$message({
                    type: 'info',
                    message: `弹幕发送失败`
                });
            }
        },
        // 图像上传处理
        async getImage() {
            this.url1=""; // 图片列表最后一张图片
            let tmp = this.url.split('/'); // 从服务端获得图片信息
            let name = tmp[tmp.length - 1];
            this.url1 = "http://172.18.167.9:9000/process_bokeh/"+name;
            console.log(this.url1)

        },
        handleSuccess(response, file, fileList) {
            console.log(response)
        },
        submitUpload() {
            this.$refs.upload.submit();
        },
        async handleRemove(file, imgList) {
            let temp=file.url.split('/');
            let name=temp[temp.length-1];
            let res = await del('/delete/'+name);
            console.log(res)
        },
        handlePreview(file) {
            // 清除弹幕
            // 更新图片
            console.log(file.url);
            this.currentImg=file.url;
            // TODO: 希望以file.name + mask的形式存储在后端
            file.maskUrl = "http://172.18.167.9:9000/process_bokeh/"+file.name;
            this.$refs.mask.crossOrigin = '';
            this.currentMask = file.maskUrl;
            // console.log(this.currentMask);
            if(this.barrage !== undefined) {
                this.barrage.setData([]);
            
            }
            // this.loadImage();
            
        }, 
        async addUrl() {
            let data={url:this.inputUrl};
            let res = await post("/upload_image", data);
            console.log(res);
            this.imgList.push(data);
        }

    }
}
</script>

<style scoped>
html, body {
  /* font: 14px/18px Helvetica, Arial, 'Microsoft Yahei', Verdana, sans-serif; */
  width: 600px;
  margin: 0;
  /* padding: 0;
  background: #eee;
  overflow: hidden; */
}
#container {
    width: 700px;
    height: 540px;
    margin: 0 auto;
}
img {
    height: 500px;
    width: auto;
}
.sending {
    width: 700px;
    margin: 0 auto;
}
.inputFrame {
    float: left;
    width: 85%;
    margin-right: 5%;
    text-align: right;
}
.buttonFrame {
    float: right;
    width: 10%;
}
.inputFrame, .buttonFrame {
    margin-top: 10px;
    margin-bottom: 10px;
}
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