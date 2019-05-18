<template>
    <div>
        <h2>图像弹幕</h2>
        <div id="container" ref="container" >
            <!-- controls 属性规定浏览器应该为视频提供播放控件。 -->
            <img src="../../../public/Imgs/origin.jpg" id="oriImg" ref="oriImg" @load="loadImage"/>
            
        </div>
        <img src="../../../public/Imgs/mask.png" id="mask" ref="mask" hidden/>
        <!-- 发送弹幕模块 -->
        <el-input v-model="input" placeholder="请输入内容"></el-input>
        <el-button type="primary" round @click="sendBarrage">发送</el-button>
        <!-- 播放演示弹幕 -->
        <el-button type="primary" round @click="playBarrage">播放演示弹幕</el-button>
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
            time: null
        }
    },
    mounted() {
        this.time = new Date();
        this.currentTime = this.time.getTime();
    },
    methods: {
        loadImage: function () {
            // console.log("loadImage")
            this.oriImg = this.$refs.oriImg;
            console.log("origin Image 的宽和高 " + this.oriImg.height + " " + this.oriImg.width)
            this.container = this.$refs.container;
            this.mask = this.$refs.mask;
            // 设置宽高
            this.container.style.height = this.oriImg.height +'px';
            this.container.style.width = this.oriImg.width +'px';
            console.log("container的宽和高 " + this.container.style.height + " " + this.container.style.width)
            // 设置弹幕
            this.barrage = new Barrage({container: this.container});
            this.barrage.canvas.height = this.oriImg.height - 80;
            // 装载弹幕数据
            this.barrage.setData(data);
            this.getImages();
            this.computeImgMask();
            this.barrage.play();
            // this.handleImgBarrage();
        },

        // 获取图像
        getImages: function() {
            this.vCanvas = document.createElement('canvas');
            this.vCanvas.width = this.oriImg.width;
            this.vCanvas.height = this.oriImg.height;
            this.vContext = this.vCanvas.getContext('2d');
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
            } else {
                console.log("弹幕发送失败") 
            }
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

div {
    margin: 0 auto; /*居中*/
}

#container {
  margin: 0 auto;
  /* margin-left: 50vw; */
  /* transform: translate(-50%, -50%); */
  background-color: red;
}



</style>
