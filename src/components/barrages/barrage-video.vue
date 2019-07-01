<template>
    <div class="outline">
        <h2>视频弹幕</h2>
        <div id="videoContainer" class="videoContainer" ref="videoContainer" >
            <span id="loading" class="loading" data-percent="0" ref="loadingProcess" v-show="showLoadingBar"></span>

        </div>
        <div id="replayContainer">
            <el-button type="primary" round @click="playVideo" v-show="playing == 0">重播</el-button>
        </div>


        <!-- 发送弹幕模块 -->
        <div class="sending">
            <div class="inputFrame">
                <el-input v-model="input" placeholder="请输入内容" @keyup.enter.native="sendBarrage"></el-input>
            </div>
            <div class="buttonFrame">
                <el-button type="primary" round @click="sendBarrage">发送</el-button>
            </div>
        </div>

        <!-- 选择视频 -->
        <div class="videoSelection">
            <!-- 选择上传 -->
            <el-upload
                class="upload-demo"
                :on-preview="handlePreview"
                :file-list="videoList"
                list-type="picture-card"
                action="http://172.18.167.9:9000/upload_image">
                <i class="el-icon-plus"></i>
            </el-upload>
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
            //video: this.$refs.video,
            vCanvas: null,
            vContext: null,
            input: "样例弹幕",
            // percent
            eleLoading: null,
            // common
            maxLength: 0,
            indexRange: null,
            // frame
            frameSequence: { length: 0 },
            eleContainer: null,

            // mask
            maskSequence: { length: 0 },
            videoContainer:  this.$refs.videoContainer,
            input: "",

            currentMask: "", // url of mask
            mask: null,
            first: true,

            testMask: null,
            globalIndex: 0,
            debug: false,
            showLoadingBar: true,
            // video list
            videoList: [{
                    name: "blackswan",
                    origin: "",
                    url:  "http://172.18.167.9:9000/get_video_frame/blackswan_00000.jpg"
                }, {
                    name: "bmx-trees",
                    url: "http://172.18.167.9:9000/get_video_frame/bmx-trees_00000.jpg"
                }, {
                    name: "camel",
                    url:  "http://172.18.167.9:9000/get_video_frame/camel_00000.jpg"
                },{
                    name: "breakdance",
                    url:  "http://172.18.167.9:9000/get_video_frame/breakdance_00000.jpg"
                },{
                    name: "cows",
                    url:  "http://172.18.167.9:9000/get_video_frame/cows_00000.jpg"
                },{
                    name: "dance-twirl",
                    url:  "http://172.18.167.9:9000/get_video_frame/dance-twirl_00000.jpg"
                } /*,{
                    name: "bmx-bumps",
                    url:  "http://172.18.167.9:9000/get_video_frame/bmx-bumps_00000.jpg"
                }, {
                    name: "boat",
                    url:  "http://172.18.167.9:9000/get_video_frame/boat_00000.jpg"
                }*/
                // {
                    // name: 'bird.png',
                    // url: require('./origin.jpg')
                // }
            ],
            videoName: "blackswan",
            isPlayed: false,
            finishLoadFrame: false,
            finishLoadMask: false,
            // sendBarrage
            time: null,
            currentTime: null,
            playing: -1, // init
            roundNum: 5
        }
    },
    mounted() {
        // init common
        
       
        this.indexRange = [0, 49];
        this.maxLength= this.roundNum * (this.indexRange[1]+1);
        // init frame
        this.eleContainer = this.$refs.videoContainer;
        this.eleLoading = this.$refs.loadingProcess;
        this.frameSequence = { length: 0 };

        // init mask
        this.videoContainer = this.$refs.videoContainer;

        // init barrage
        this.barrage = new Barrage({container: this.videoContainer, avoidOverlap: false});
        this.barrage.canvas.height = this.videoContainer.clientHeight - 80;
        // 装载弹幕数据
        this.barrage.setData(data);
        this.barrage.setConfig({ speed: 200 });
        // this.barrage.setData();
        this.first = true;
        this.loadFrame();
        this.loadMask();
    },
    methods: {
        // 实时获取视频图像
        getVideoFrame: function() {
            // this.video = this.$refs.video;
            this.vCanvas = document.createElement('canvas');
            this.vCanvas.width = 880;
            this.vCanvas.height = 540;
            this.vContext = this.vCanvas.getContext('2d');
            var that = this;
            // 将视频绘制到canvas
            this.barrage.afterRender = () => {
                // console.log(that.frameSequence.length);
                if(that.maskSequence[that.globalIndex] !== undefined) {
                    try {
                        this.vContext.drawImage(that.maskSequence[that.globalIndex], 0, 0, this.vCanvas.width, this.vCanvas.height);
                    } catch(DOMException) {
                        this.$message({
                            type: 'info',
                            message: `加载失败，请刷新重试`
                        });
                    }
                    
                } else {
                }
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
            // 获取时间
            this.time = new Date();
            const success = this.barrage.add({
                time: this.time.getTime() - this.currentTime, // 弹幕出现的时间(单位：毫秒)
                text: this.input,
                fontSize: 32,
                color: '#ff0000'
            });
            // 弹出时间
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
            this.time = null;
        },
        // dealing with frame
        loadFrame: function() {
            // 遍历每一轮
            for (var round = 0; round < this.roundNum; round++) {
                (function(round, this_) {
                    // 遍历一轮中的每一帧
                    for(var start = this_.indexRange[0]; start <= this_.indexRange[1]; start++) {
                        var that = this_;
                        (function (index, that) {
                            // 创建图片
                            var img = document.createElement("img");
                            img.crossOrigin = '';
                            img.height = 540;
                            img.width = 880;
                            // 设置图片地址
                            if(that.debug) {
                                if(start < 10) {
                                    img.src = "http://172.18.167.9:8891/view/datasets/DAVIS2016/results/" + that.videoName + "/0000" + index + ".png";
                                } else {
                                    // img.src = require("./../../../public/Videos/DAVIS2016/results/" + that.videoName + "/000" + index + ".png");
                                }
                            } else {
                                if(start < 10) {
                                    img.src = "http://172.18.167.9:9000/get_video_frame/" + that.videoName + "_0000" + index + ".jpg";
                                    // img.src = require("./0000" + index + ".jpg");
                                } else {
                                        img.src = "http://172.18.167.9:9000/get_video_frame/" + that.videoName + "_000" + index + ".jpg";
                                        //img.src = require("./0000" + index + ".jpg")
                                }
                            }
                            // 异步等待图片加载
                            img.onload=function() {
                                that.frameSequence.length++;
                                that.frameSequence[index+round *  (that.indexRange[1] + 1)] = this;
                                // 设置进度条
                                // console.log(that.frameSequence.length + " " + that.maxLength)
                                var percent = Math.round(100 * that.frameSequence.length / that.maxLength);
                                that.eleLoading.setAttribute('data-percent', percent);
                                that.eleLoading.style.backgroundSize = percent + '% 100%';
                                // 先将第一个图片添加
                                if(index + round *  (that.indexRange[1] + 1) === that.indexRange[0]) {
                                    that.eleContainer.appendChild(this);
                                }
                                // 所有图片都加载
                                if(index + round *  (that.indexRange[1] + 1) === that.maxLength - 1){
                                    // console.log("finish LoadFrame");
                                    // 设置加载图片状态：true
                                    that.finishLoadFrame = true;
                                    // mask也加载完毕且未播放，则播放
                                    if(that.finishLoadMask && that.playing != 1) {
                                        // console.log("playVideo");
                                        that.playVideo();
                                    }
                                }
                            };
                            img.onerror = function(err) {
                                that.$message({
                                    type: 'info',
                                    message: `加载失败，请刷新重试`
                                });
                                // console.log("img.onerror");
                                that.frameSequence.length++;
                                that.frameSequence[index + round * (that.indexRange[1] + 1)] = this;
                                // 图片加载完
                                if(index  + round * (that.indexRange[1] + 1) === that.maxLength - 1){
                                    that.finishLoadFrame = true;
                                    // 播放
                                    if(that.finishLoadMask && that.playing != 1) {
                                        that.playVideo();
                                    }
                                }
                            };                        
                        })(start, that);
                    }
                })(round, this);
                
            }
            
        },
        playVideo: function() {
            console.log("playVideo is called")
            // 当前状态：未播放
            if(this.playing != 1) {
                // 改状态：已播放
                this.playing = 1;
                // 获取起始时间
                this.currentTime = new Date().getTime();
                // 如果上一个视频已经播放完毕
                if(this.globalIndex === this.maxLength - 1) {
                    // 移除上个视频的最后一帧
                    this.eleContainer.removeChild(this.frameSequence[this.globalIndex]);
                }
                this.showLoadingBar = false;
                // 播放弹幕
                this.barrage.replay();
                // 播放
                var index = this.indexRange[0];
                // 轮播图片
                var that = this;
                var step = function () {
                    // 记录全局index
                    that.globalIndex = index;
                    // 正常情况remove上一帧，切换的话remove上一个视频的最后一帧
                    //if(that.frameSequence[index] != undefined) {
                    // 移除上一帧
                    if(index !== 0 && that.eleContainer.lastChild.tagName === "IMG")
                        that.eleContainer.removeChild(that.eleContainer.lastChild);
                    else
                        console.log("last child: " + that.eleContainer.lastChild)
                    
                    // 添加下一帧，避免重复添加
                    if( that.eleContainer.lastChild.tagName != "IMG") {
                        that.eleContainer.appendChild(that.frameSequence[index]);
                        console.log ("append " + that.frameSequence[index]);
                    }
                        

                        
                    index++;
                    //}

                    // 未播放完毕
                    if (index < that.maxLength) {
                        setTimeout(step, that.debug ? 1000 : 100);
                    } else {
                        // 暂停弹幕
                        that.barrage.pause();
                        // 当前状态：未播放
                        that.playing = 0;
                    }
                };
                // 等100%动画结束后执行播放
                setTimeout(step, 1);
            }

        },
        // mask, 事先加载到序列数组里
        loadMask: function() {
            // 循环播放轮数
            for (var round = 0; round < this.roundNum; round++) {
                (function(round, this_) {
                    // 循环每一帧mask
                    for(var start = this_.indexRange[0]; start <= this_.indexRange[1]; start++) {
                        var that = this_;
                        (function (index, that) {
                            // 创建图像DOM
                            var img = document.createElement("img");
                            // 设置相关属性
                            img.height = 450;
                            img.width = 880;
                            img.crossOrigin = "";
                            // 异步等待图片加载
                            img.onload=function() {
                                that.maskSequence.length++;
                                // 加载完的图片存入数组
                                that.maskSequence[index + round * (that.indexRange[1] + 1)] = this;
                                // 最后一张mask加载完
                                if(index + round *  (that.indexRange[1] + 1) === that.maxLength - 1) {
                                    // console.log("finishLoadMask")
                                    that.finishLoadMask = true;
                                    // 设置弹幕
                                    that.getVideoFrame();
                                    // 计算mask
                                    that.computeFrameMask();
                                    // 播放
                                    if(that.finishLoadFrame && that.playing != 1) {
                                        that.playVideo();
                                    }
                                }
                            };
                            img.onerror = function() {
                                that.maskSequence.length++;
                                that.maskSequence[index + round *  (that.indexRange[1] + 1)] = this;
                                if(index + round *  (that.indexRange[1] + 1) === that.maxLength - 1) {
                                    // console.log("finishLoadMask")
                                    that.finishLoadMask = true;
                                    that.getVideoFrame();
                                    that.computeFrameMask();
                                    if(that.finishLoadFrame && that.playing != 1) {
                                        that.playVideo();
                                    }
                                }
                            };
                            if(start < 10) {
                                img.src = "http://172.18.167.9:9000/get_video_mask/" + that.videoName + "_0000" + index + ".png";
                            } else {
                                img.src = "http://172.18.167.9:9000/get_video_mask/" + that.videoName + "_000" + index + ".png";
                            }
                            
                        })(start, that);
                    }
                })(round, this);
                
            }
        },
        handlePreview(file) {
            // 处理异常
            // console.log("handle " + this.frameSequence.length)
             if(this.frameSequence.length != this.maxLength) {
                 // this.frameSequence.length
                 return;
             } else if (this.videoName !== file.name &&  this.finishLoadFrame && this.finishLoadMask) {
                this.playing = -1;
                this.finishLoadFrame = false;
                this.finishLoadMask = false;
                this.showLoadingBar = true;
                this.barrage.pause(); 
                this.barrage.goto(0); 
                this.barrage.setData([]);
                this.barrage.setData(data);
                // 清除弹幕
                // 更新图片
                this.first = true;
                this.videoName=file.name;
                if(this.eleContainer.lastChild.tagName === "IMG")
                    this.eleContainer.removeChild(this.frameSequence[this.globalIndex]);
                this.frameSequence = null;
                this.maskSequence = null;
                this.frameSequence = {
                    length: 0
                };
                this.maskSequence = {
                    length: 0
                }
                this.loadFrame();
                this.loadMask();
                this.globalIndex = 0;
                // while(!(this.finishLoadFrame && this.finishLoadMask)) {

                // }

                // this.playVideo();

                // file.maskUrl = "http://172.18.167.9:9000/process_barrage/"+file.name;
                // console.log(file.maskUrl);
                // this.$refs.mask.crossOrigin = '';
                // this.currentMask = file.maskUrl;
                // // console.log(this.currentMask);
                // if(this.barrage !== undefined) {
                //     this.barrage.setData([]);

                // }
                // this.loadImage();

            }
        }



    }
}
</script>

<style scoped>
h2 {
    text-align: center;
}
html, body {
  font: 14px/18px Helvetica, Arial, 'Microsoft Yahei', Verdana, sans-serif;
  width: 100%;
  margin: 0;
  padding: 0;
  background: #eee;
  overflow: hidden;
}
#container, #video, .videoContainer {
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

#replayContainer {
    height: 50px;
    text-align: center;
    position: relative;
}
</style>
