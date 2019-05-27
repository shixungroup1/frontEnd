<template>
    <div>
        <p>This is SA</p>
       
    </div>
</template>

<script>
    import {get, post} from '../libs/http';
    export default {
        name: "tabSA",
        data() {
            return{
                fileList: [
                    {name: 'food.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'},
                    {name: 'food2.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'}
                ],
                url: "",
                url1:"",
                fitMethod: 'contain'
            }

        },
        methods: {
            async getImage() {
                let data={};
                let res = await get('/get',data);
                console.log(res)
            },
            submitUpload() {
                this.$refs.upload.submit();
            },
            handleRemove(file, fileList) {
                console.log(file, fileList);
            },
            handlePreview(file) {
                console.log(file);
                this.url=file.url;
            }
        }

    }
</script>

<style scoped>
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
