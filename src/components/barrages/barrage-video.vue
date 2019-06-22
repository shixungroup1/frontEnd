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
                <el-input v-model="input" placeholder="请输入内容"></el-input>
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
            maxLength: 50,
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
                    url: require("./../../../public/Videos/DAVIS2016/JPEGImages/1080p/bmx-trees/00000.jpg")
                }, {
                    name: "camel",
                    url: require("./../../../public/Videos/DAVIS2016/JPEGImages/1080p/camel/00000.jpg")
                }
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
            playing: -1 // init
        }
    },
    mounted() {        
        // init common
        this.maxLength= 50;
        this.frameSequence = { length: 0 };
        this.indexRange = [0, 49];
        // init frame
        this.eleContainer = this.$refs.videoContainer;
        this.eleLoading = this.$refs.loadingProcess;
        
        // init mask
        this.videoContainer = this.$refs.videoContainer;
        
        // init barrage
        this.barrage = new Barrage({container: this.videoContainer});
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
                    
                    this.vContext.drawImage(that.maskSequence[that.globalIndex], 0, 0, this.vCanvas.width, this.vCanvas.height);
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
            this.time = new Date();
            // console.log("time " );
            // console.log(1000 * (Math.random()) );
            // console.log((this.time.getTime() - this.currentTime)/10);
            const success = this.barrage.add({
                time: this.time.getTime() - this.currentTime - 2000, // 弹幕出现的时间(单位：毫秒)
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
            this.time = null;
        },
        // 处理图片
        handleImgBarrage: function() {
        },
        computeImgMask: function() {
        },

        // dealing with frame
        loadFrame: function() {
            
            // this.barrage.play();
            for(var start = this.indexRange[0]; start <= this.indexRange[1]; start++) {
                var that = this;
                
                (function (index, that) {
                    var img = document.createElement("img");
                    img.crossOrigin = '';
                    img.height = 540;
                    img.width = 880;
                    if(that.debug) {
                        if(start < 10) {
                            img.src = "http://172.18.167.9:8891/view/datasets/DAVIS2016/results/" + that.videoName + "/0000" + index + ".png";
                        } else {
                            img.src = require("./../../../public/Videos/DAVIS2016/results/" + that.videoName + "/000" + index + ".png");
                        }
                    } else {
                        if(start < 10) {
                            img.src = "http://172.18.167.9:9000/get_video_frame/" + that.videoName + "_0000" + index + ".jpg";
                        } else {
                            img.src = "http://172.18.167.9:9000/get_video_frame/" + that.videoName + "_000" + index + ".jpg";
                        }
                    }
                    img.onload=function() {
                        console.log("img.onload");
                        that.frameSequence.length++;
                        that.frameSequence[index] = this;
                        var percent = Math.round(100 * that.frameSequence.length / that.maxLength);
                        that.eleLoading.setAttribute('data-percent', percent);
                        that.eleLoading.style.backgroundSize = percent + '% 100%';
                        if(index === that.indexRange[0]+1) {
                            that.eleContainer.appendChild(that.frameSequence[0]);
                            
                        }
                        if(index === that.indexRange[1]){
                            that.finishLoadFrame = true;
                            if(that.finishLoadMask && that.playing != 1) {
                                that.playVideo();
                            }
                        }
                    };
                    img.onerror = function(err) {
                        that.frameSequence.length++;
                        that.frameSequence[index] = this;
                        // that.playVideo();
                    };
                    
                    
                })(start, that);
            }
        },
        playVideo: function() {
            if(this.playing != 1) {
                this.playing = 1;
                this.currentTime = new Date().getTime();
                if(this.globalIndex === this.indexRange[1]) {
                    this.eleContainer.removeChild(this.frameSequence[this.globalIndex]);
                }
                this.showLoadingBar = false;
            // this.playMask();
                this.barrage.replay();
                var percent = Math.round(100 * this.frameSequence.length / this.maxLength);
                // 全部加载完毕，无论成功还是失败
                if (percent == 100) {
                    var index = this.indexRange[0];
                    // 
                    // 依次append图片对象
                    var that = this;
                    var step = function () {
                        that.globalIndex = index;
                        // 正常情况remove上一帧，切换的话remove上一个视频的最后一帧
                        //if(that.frameSequence[index] != undefined) {
                            console.log("index" + index);
                            console.log("lastChild" + that.eleContainer.lastChild.tagName);
                            if(index != 0)
                                that.eleContainer.removeChild(that.frameSequence[index - 1]);
                            //if(that.eleContainer.lastChild )
                            if( that.eleContainer.lastChild.tagName != "IMG")
                                that.eleContainer.appendChild(that.frameSequence[index]);
                            index++;
                        //}
                        
                        
                        
                        // 序列增加
                        
                        // 如果超过最大限制
                        if (index <= that.indexRange[1]) {
                            setTimeout(step, that.debug ? 1000 : 100);
                        } else {
                            that.barrage.pause();
                            that.isPlayed = true;
                            that.playing = 0;
                            // 本段播放结束回调
                            // 我这里就放一个重新播放的按钮
                            // that.eleContainer.insertAdjacentHTML('beforeEnd', '<button @click="playVideo">再看一遍</button>');
                        }
                    };
                    // 等100%动画结束后执行播放
                    setTimeout(step, 100);
                }
            }
            
        },
        // mask, 事先加载到序列数组里
        loadMask: function() {
            for(var start = this.indexRange[0]; start <= this.indexRange[1]; start++) {
                var that = this;
                (function (index, that) {
                    var img = document.createElement("img");
                    img.height = 450;
                    img.width = 880;
                    img.onload=function() {
                        that.maskSequence.length++;
                        that.maskSequence[index] = this;
                        if(index === that.indexRange[1]) {
                            that.finishLoadMask = true;
                            that.getVideoFrame();
                            that.computeFrameMask();
                            if(that.finishLoadFrame && that.playing != 1) {
                                that.playVideo();
                            }
                            
                        }
                        
                        // that.playMask();
                    };
                    img.onerror = function() {
                        that.maskSequence.length++;
                        that.maskSequence[index] = this;
                        // that.playMask();
                    };
                    if(start < 10) {
                        img.src = require("./../../../public/Videos/DAVIS2016/results/"+ that.videoName + "/0000" + index + ".png");
                    } else {
                        img.src = require("./../../../public/Videos/DAVIS2016/results/"+ that.videoName + "/000" + index + ".png");
                    }
                    
                })(start, that);
            }
        },
        // interact with backend
        // TODO: 从后端加载图像列表
        created: async function () {
            // let res = await get('/list_images');
            // let form = res.data.data;
            // form.forEach((item)=>{
            //     let temp = item.split('/');
            //     let name = temp[temp.length-1];
            //     this.imgList.push({name:name, url:item});
            // })
        },
        handlePreview(file) {
            // 处理异常
            console.log("handle " + this.frameSequence.length)
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
                // 清除弹幕
                // 更新图片
                this.first = true;
                this.videoName=file.name;
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