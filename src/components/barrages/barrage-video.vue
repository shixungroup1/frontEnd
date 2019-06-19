<template>
    <div class="outline">
        <div id="videoContainer" class="videoContainer" ref="videoContainer" >
            <span id="loading" class="loading" data-percent="0" ref="loadingProcess"></span>
        </div>
        <button @click="loadFrame">play image frame</button>
        <hr/>
        <h2>视频弹幕</h2>
        <div id="container" ref="container">
            controls 属性规定浏览器应该为视频提供播放控件。
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
        
        <!-- 播放演示弹幕 -->
        <div class="example">
            <el-button type="primary" round>播放演示弹幕</el-button>
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
            container: this.$refs.container,
            //video: this.$refs.video,
            vCanvas: null,
            vContext: null,
            input: "样例弹幕",
            eleLoading: null,
            store: { length: 0 },
            maxLength: 49,
            indexRange: null,
            videoFrame: null,
            input: "",
            eleContainer: null
            
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
        this.computeFrameMask();
        this.bindVideoBarrage();
        this.eleContainer = this.$refs.videoContainer;
        this.eleLoading = this.$refs.loadingProcess;
        this.maxLength= 49;
        this.store = { length: 0 };
        this.indexRange = [0, 2];
        this.videoSrc ="./00000.jpg";
        
    },
    methods: {
        // 实时获取视频图像
        getVideoFrame: function() {
            // this.video = this.$refs.video;
            this.vCanvas = document.createElement('canvas');
            this.vCanvas.width = 880;
            this.vCanvas.height = 540;
            this.vContext = this.vCanvas.getContext('2d');
            // 将视频绘制到canvas
            this.barrage.afterRender = () => {
                this.vContext.drawImage(this.eleContainer, 0, 0, this.vCanvas.width, this.vCanvas.height);
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
            /*this.video.addEventListener('play', () => {
                this.barrage.play();
            }, false);
            // 暂停事件
            this.video.addEventListener('pause', () => {
                this.barrage.pause();
            }, false);
            // 切换播放进度
            this.video.addEventListener('seeked', () => {
                this.barrage.goto(this.video.currentTime * 1000);
            }, false);*/
        },
        // 发送弹幕
        sendBarrage: function() {
            console.log(this.video.currentTime * 1000)
            const success = this.barrage.add({
                time: this.video.currentTime * 1000, // 弹幕出现的时间(单位：毫秒)
                text: this.input,
                color: '#ff0000',
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
        },

        // dealing with frame
        loadFrame: function() {
            this.barrage.play();
            for(var start = this.indexRange[0]; start <= this.indexRange[1]; start++) {
                var that = this;
                (function (index, that) {
                    
                    var img = document.createElement("img");
                    img.height = 450;
                    img.width = 880;
                    img.onload=function() {
                        that.store.length++;
                        that.store[index] = this;
                        that.playVideo();
                    };
                    img.onerror = function() {
                        console.log ("in onerror");
                        //console.log(typeof this);
                        //console.log(this);
                        that.store.length++;
                        that.store[index] = this;
                        that.playVideo();
                    };
                    if(start < 10) {
                        img.src = require("./../../../public/Videos/DAVIS2016/JPEGImages/1080p/blackswan/0000" + index + ".jpg");
                    } else {
                        img.src = require("./../../../public/Videos/DAVIS2016/JPEGImages/1080p/blackswan/000" + index + ".jpg");
                    }
                    console.log (img);
                })(start, that);
            }
        },
        playVideo: function() {
            console.log("in play video func ");
            var percent = Math.round(100 * this.store.length / this.maxLength);
            this.eleLoading.setAttribute('data-percent', percent);
            this.eleLoading.style.backgroundSize = percent + '% 100%';
            // 全部加载完毕，无论成功还是失败
            if (percent == 100) {
                var index = this.indexRange[0];
                this.eleContainer.innerHTML = '';
                // 依次append图片对象
                var that = this;
                var step = function () {
                    if (that.store[index - 1]) {
                        that.eleContainer.removeChild(that.store[index - 1]);
                    }
                    //var img = new Image();
                    console.log("that.store[index]");
                    console.log(that.store[index]);
                    that.eleContainer.appendChild(that.store[index]);
                    // 序列增加
                    index++;
                    // 如果超过最大限制
                    if (index <= that.indexRange[1]) {
                        setTimeout(step, 42);
                    } else {
                        // 本段播放结束回调
                        // 我这里就放一个重新播放的按钮
                        that.eleContainer.insertAdjacentHTML('beforeEnd', '<button onclick="play()">再看一遍</button>');
                    }
                };
                // 等100%动画结束后执行播放
                setTimeout(step, 1000);
            }
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


.videoContainer {
    width: 880px; 
    height: 540px;
    margin: auto;
    background-color: #000;
    position: relative;
}
.videoContainer > img {
    position: absolute;
    width: 100%;
    height: 100%;
}
.loading {
    position: absolute;
    height: 8px; width: 150px;
    border: 1px solid #eee;
    background: linear-gradient(to top, #eee, #eee);
    background-size: 0 100%;
    transition: background-size .1s;
    left: 0; top: 0; right: 0; bottom: 0;
    margin: auto;
}
.loading::before {
    content: attr(data-percent)'%';
    position: absolute;
    left: 0; top: -1.5em;
    font-size: 12px;
    color: #eee;
}
</style>