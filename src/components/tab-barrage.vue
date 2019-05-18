<template>
    <div id="container" ref="container">
        <!-- controls 属性规定浏览器应该为视频提供播放控件。 -->
        <video src="../../public/Videos/demo.mp4" id="video" alt="" ref="video" controls/>
        <!-- 发送弹幕模块 -->
        <el-input v-model="input" placeholder="请输入内容"></el-input>
        <el-button type="primary" round @click="sendBarrage">发送</el-button>
    </div>
</template>

<script>
import Barrage from 'barrage-ui';
import data from '../plugins/utils/mockData.js';

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
        this.container = this.$refs.container;
        
        this.barrage = new Barrage({container: this.container});
        this.barrage.canvas.height = this.container.clientHeight - 80;
        // 装载弹幕数据
        this.barrage.setData(data);
        // this.barrage.setData();
        this.getVideoFrame();
        this.computeMask();
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
        computeMask: function() {
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
            console.log("send method")
            const result = this.barrage.add({
                time: this.video.currentTime * 1000, // 弹幕出现的时间(单位：毫秒)
                text: '这是新增的一条弹幕'
            });
            console.log(result)
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
}

#container {
  margin: 0 auto;
  margin-top: 50vh;
  margin-left: 50vw;
  transform: translate(-50%, -50%);
  background-color: #ddd;
}


</style>
