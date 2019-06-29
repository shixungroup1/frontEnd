<template>
    <div class="outline">
        <h2>图像弹幕</h2>
        <!-- 原图 -->
        <div class="container" ref="container" >
            <el-image :src="url" class="img" :fit="fitMethod" v-if="currentImg === ''">
                <div slot="error">
                    <div class="im-slot">
                        <span>请选择一张图片</span>
                    </div>
                </div>
            </el-image>

        </div>
        <img :src="currentImg" id="oriImg" ref="oriImg" @load="loadImage"/>

        <!-- 蒙版 -->
        <img :src="currentMask" id="mask" ref="mask" hidden/>

        <!-- 发送弹幕模块 -->
        <div class="sending">
            <div class="inputFrame">
                <el-input v-model="input" placeholder="请输入内容"></el-input>
            </div>
            <div class="buttonFrame">
                <el-button type="primary" round @click="sendBarrage">发送</el-button>
            </div>
            <!-- 播放演示弹幕 -->
             <div class="replayButton">
                <el-button type="primary" round @click="playBarrage">重播演示弹幕</el-button>
            </div>
        </div>


        <!-- 选择图片 -->
        <div class="imgSelection">
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
                :auto-upload="true">
                <i class="el-icon-plus"></i>
            </el-upload>
            <div class="margin">
                <el-input v-model="inputUrl" placeholder="请输入内容">
                    <el-button slot="append" @click="addUrl">添加链接</el-button>
                </el-input>
            </div>
        </div>
    </div>

</template>

<script>

import Barrage from 'barrage-ui';
import data from '../../plugins/utils/mockData.js';
import {get, post, del} from '../../libs/http';
import list from '../list';

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
            url: "",
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
        // this.currentTime = this.time.getTime();
        // 初始化默认图片
        this.currentImg = "";
        this.currentMask = "";
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
           //  this.$refs.sendingFrame.style.width = this.oriImg.width +'px';
            // console.log("container的宽和高 " + this.container.style.height + " " + this.container.style.width)
            // 设置弹幕
            this.barrage = new Barrage({container: this.container, avoidOverlap: false});

            // 装载弹幕数据
            this.barrage.setData(data);
            this.barrage.canvas.height = this.oriImg.height;
            this.getImages();
            this.computeImgMask();
            this.barrage.play();
            //console.log("第一次播放弹幕");
        //this.currentTime = this.time.getTime();
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
            console.log("duration " );
            // console.log(1000 * (Math.random()) );
            console.log((this.time.getTime() - this.currentTime)/10);
            const success = this.barrage.add({
                time: this.time.getTime() - this.currentTime, // 弹幕出现的时间(单位：毫秒)
                text: this.input,
                fontSize: 32,
                color: '#ff0000'
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
            console.log(response);
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
            
            // 更新图片
            this.currentImg=file.url;
            file.maskUrl = "http://172.18.167.9:9000/process_barrage/"+file.name;
            console.log(file.maskUrl);
            this.$refs.mask.crossOrigin = '';
            this.currentMask = file.maskUrl;
            // this.currentTime = this.time.getTime();
            // console.log(this.currentMask);
            this.time = new Date();
            this.currentTime = this.time.getTime();
            // 清除弹幕
            if(this.barrage !== undefined) {
                this.barrage.setData([]);
                
            }
            // this.loadImage();

        },
        async addUrl() {
            // this.submitUpload();
            let tmp = this.inputUrl.split('/'); // 从服务端获得图片信息
            let filename = tmp[tmp.length - 1];
            let data={url:this.inputUrl, name:filename};
            let res = await post("/upload_image", data);

            console.log(res);
            this.imgList.push(data);
        }

    }
}
</script>

<style scoped>
/* title */
h2 {
    text-align: center;
}
.outline {
    /* margin-left:50px;
    margin-right:50px; */
    text-align: center;
}

/* image display */

.container {
    height: 500px;
    margin-right: auto;
    margin-left: auto;
     /* border: blue solid 1px; */
}

.img {
    width: 700px;
    visibility:visible;
}

#oriImg {
    /* translate: -500px; */
    display: block;
    height: 500px;
    margin-top: -500px;
    margin-right: auto;
    margin-left: auto;
    z-index: -1;
    /* border: red solid 1px; */
}
/* barrage */
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
.replayButton {
    margin: 0 auto;
    text-align: center;
}

/* image selection */
.imgSelection {
    margin: 5%;
}
.margin {
    margin: 10px;
}

.im-slot {
    text-align: center;
    line-height: 500px;
    border: 1px dashed #c0ccda;
    border-radius: 6px;
}
</style>
