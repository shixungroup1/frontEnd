<template>
    <div>
        <h2>图像弹幕</h2>
        <div id="container" ref="container" >
            <img :src="currentImg" id="oriImg" ref="oriImg" @load="loadImage"/>
        </div>
        <!-- 蒙版 -->
        <img :src="currentMask" id="mask" ref="mask" @load="loadMask" hidden/>
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
            <el-button type="primary" round @click="playBarrage">播放演示弹幕</el-button>
        </div>
        <!-- 选择图片 -->
        <div>
            <div>
                
            </div>
            <!-- 选择上传 -->
            <el-upload
                class="upload-demo"
                ref="upload"
                action="https://jsonplaceholder.typicode.com/posts/"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :file-list="imgList"
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
    </div>
    
</template>

<script>

import Barrage from 'barrage-ui';
import data from '../../plugins/utils/mockData.js';
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
                {
                    name: 'bird.jpg',
                    url: require('./origin.jpg'),
                    maskUrl: require('../../../public/Masks/mask.png')
                    
                },
                {
                    name: 'cake.jpg',
                    url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100',
                    maskUrl: require('../../../public/Masks/mask2.jpg')
                }
            ],
            currentImg: "./origin.jpg",
            currentMask: "../../../public/Masks/mask.png",
            url1:"",
            fitMethod: 'crop',
            finishLoadingMask: false,
            finishLoadingImg: false
        }
    },
    mounted() {
        // 处理时间，用于控制弹幕播放进度
        this.time = new Date();
        this.currentTime = this.time.getTime();
        // 初始化默认图片
        this.currentImg = require("./origin.jpg");
        this.container = this.$refs.container;
        
        
    },
    methods: {
        loadImage: function () {
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
            this.barrage.replay();
            // this.handleImgBarrage();
        },
        loadMask: function() {
            console.log("---loadMask---")
            this.finishLoadingMask = true;
        },
        // 获取图像
        getImages: function() {
            this.vCanvas = document.createElement('canvas');
            this.vCanvas.width = this.oriImg.width;
            this.vCanvas.height = this.oriImg.height;
            this.vContext = this.vCanvas.getContext('2d');
            console.log(this.finishLoadingMask);
            console.log(this.finishLoadingImg);
            // while(!this.finishLoadingMask) {

            // }
            this.barrage.afterRender = () => {
                this.vContext.drawImage(this.mask, 0, 0, this.oriImg.width, this.oriImg.height);
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
            console.log(this.time.getTime() - this.currentTime)
            const success = this.barrage.add({
                time: this.time.getTime() - this.currentTime, // 弹幕出现的时间(单位：毫秒)
                text: this.input
            });
            if(success) {
                this.input=""
                console.log("弹幕发送成功")
                this.$message({
                    type: 'info',
                    message: `弹幕发送成功`
                });
            } else {
                console.log("弹幕发送失败") 
                // 弹窗提示失败
                this.$message({
                    type: 'info',
                    message: `弹幕发送失败`
                });
            }
        },
        // 图像上传处理
        async getImage() {
            let data={};
            let res = await get('/get',data);
            console.log(res)
        },
        submitUpload() {
            this.$refs.upload.submit();
        },
        handleRemove(file, imgList) {
            console.log(file, imgList);
        },
        handlePreview(file) {
            console.log("handlePreview");
            console.log(file);
            // 清除弹幕
            this.barrage.setData([]);
            // 更新图片
            this.currentImg=file.url;
            // TODO: 从后端拿到mask的图片
            // file.maskUrl = require();
            this.currentMask = file.maskUrl;

        }

    }
}
</script>

<style scoped>
html, body {
  /* font: 14px/18px Helvetica, Arial, 'Microsoft Yahei', Verdana, sans-serif; */
  width: 100%;
  margin: 0;
  /* padding: 0;
  background: #eee;
  overflow: hidden; */
}
#container {
    width: 880px;
    height: 540px;
    margin: 0 auto;
}
img {
    max-width: 800px;
    height: auto;
}
.sending {
    width: 880px;
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