<template>
    <div class="outline">
        <h2>视频弹幕</h2>
        <div id="container" ref="container">
            <!-- controls 属性规定浏览器应该为视频提供播放控件。 -->
            <video src="../../../public/Videos/demo.mp4" id="video" alt="" ref="video" controls/>
        </div>
        <!-- 发送弹幕模块 -->
        <div class="sending">
            <div class="inputFrame">
                <el-input v-model="input" placeholder="请输入内容"></el-input>
            </div>
            <div class="buttonFrame">
                <el-button type="primary" round @click="sendBarrage">发送</el-button>
            </div>
        </div>
        
        <!-- 播放演示弹幕
        <div class="example">
            <el-button type="primary" round @click="playBarrage">播放演示弹幕</el-button>
        </div> -->
    </div>
    
</template>

<script>
import Barrage from 'barrage-ui';
import data from '../../plugins/utils/mockData.js';

export default {
    name: "tabBarrage",
    data() {
        return {
            container: this.$refs.container,
            video: this.$refs.video,
            vCanvas: null,
            vContext: null,
            input: "样例弹幕"

        }
    },
    mounted() {
        console.log("-------------mounted in video-------------");
        this.container = this.$refs.container;
        
        this.barrage = new Barrage({container: this.container});
        this.barrage.canvas.height = this.container.clientHeight - 80;
        // 装载弹幕数据
        this.barrage.setData(data);
        // this.barrage.setData();
        this.getVideoFrame();
        this.computeFrameMask();
        this.bindVideoBarrage();
        
    },
    methods: {
        // 实时获取视频图像
        getVideoFrame: function() {
            this.video = this.$refs.video;
            this.vCanvas = document.createElement('canvas');
            this.vCanvas.width = this.video.clientWidth;
            this.vCanvas.height = this.video.clientHeight;
            this.vContext = this.vCanvas.getContext('2d');

            // 将视频绘制到canvas
            this.barrage.afterRender = () => {
                this.vContext.drawImage(this.video, 0, 0, this.vCanvas.width, this.vCanvas.height);
            }
        },
        // 计算蒙版，即哪些地方需要透明
        computeFrameMask: function() {
            // 在弹幕动画的每一帧图像渲染前计算出蒙版图像
            this.barrage.beforeRender = () => {
                // console.log("在弹幕动画的每一帧图像渲染前计算出蒙版图像")
                const frame = this.vContext.getImageData(0, 0, this.vCanvas.width, this.vCanvas.height);
                // console.log(frame);
                const pxCount = frame.data.length / 4;
                // 构造图像蒙版，todo: 读取模型结果的图像而不是视频帧
                for(let i = 0; i < pxCount; i++) {
                    const r = frame.data[i*4+0];
                    const g = frame.data[i*4+1];
                    const b = frame.data[i*4+2];
                    // 将黑色区域以外内容设为透明
                    if(r > 15 || g > 15 || b > 15) {
                        frame.data[4*i + 3] = 0;
                    }
                }                
                // 使用蒙版
                this.barrage.setMask(frame); 
            }
            
        },
        // 使得视频和图像协同操作
        bindVideoBarrage: function() {
            // 播放事件
            this.video.addEventListener('play', () => {
                this.barrage.play();
            }, false);

            // 暂停事件
            this.video.addEventListener('pause', () => {
                this.barrage.pause();
            }, false);

            // 切换播放进度
            this.video.addEventListener('seeked', () => {
                this.barrage.goto(this.video.currentTime * 1000);
            }, false);
        },
        // 发送弹幕
        sendBarrage: function() {
            console.log(this.video.currentTime * 1000)
            const success = this.barrage.add({
                time: this.video.currentTime * 1000, // 弹幕出现的时间(单位：毫秒)
                text: this.input
            });
            if(success) {
                this.input=""
                console.log("弹幕发送成功")
            } else {
                console.log("弹幕发送失败") 
            }
        },
        // 处理图片

        handleImgBarrage: function() {

        },
        computeImgMask: function() {

        }
    }
}
</script>

<style scoped>
html, body {
  font: 14px/18px Helvetica, Arial, 'Microsoft Yahei', Verdana, sans-serif;
  width: 100%;
  margin: 0;
  padding: 0;
  background: #eee;
  overflow: hidden;
}

#container, #video {
    width: 880px;
    height: 540px;
    margin: 0 auto;
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
</style>
