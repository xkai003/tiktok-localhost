<template>
  <div class="box">
    <button @click="openwindow" style="background-color: orange;">添加二维码</button>
  </div>
  <!-- 弹窗 -->
  <div  v-show="isshoow" class="isshoow">
    <div class="center">
        <div class="head">
          <button @click="closewindow">取消</button>
          <span>图片上传</span>
        </div>

        <!-- 隐藏的 input 元素，通过点击 label 触发 -->
        <input 
          type="file" 
          @change="handleFileChange" 
          ref="fileInputRef" 
          accept="image/png, image/jpeg, image/gif"
          style="display: none;" 
        />
        <!--  -->
        <div class="body">
          <!-- 选择图片按钮 -->
          <button @click="triggerFileInput" class="btn-select"> 选择图片</button>
          <!-- 确认上传按钮和状态显示 -->
          <div class="upload-actions">
            <button 
              @click="uploadImage" 
              :disabled="!selectedFile || isLoading"
              class="btn-upload"
            >
              {{ isLoading ? '上传中...' : '开始上传' }}
            </button>
          </div>
          <!-- 删除图片 -->
          <button @click="removeImage" class="btn-remove">删除图片</button>
        </div>

        <!-- 图片预览区域 -->
        <div v-if="imagePreviewUrl" class="image-preview">
          
          <img :src="imagePreviewUrl" alt="Image Preview" />
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';

// --- 响应式状态 ---
const isshoow = ref(false);           // 控制弹窗显示
const fileInputRef = ref(null);      // 对 input 元素的引用
const selectedFile = ref(null);      // 用户选择的文件对象
const imagePreviewUrl = ref('');     // 图片预览的 URL
const isLoading = ref(false);        // 是否正在上传
const uploadStatus = ref('');        // 上传状态信息

// --- 计算属性，用于动态添加 CSS 类 ---
const statusClass = computed(() => {
  if (uploadStatus.value.includes('成功')) return 'status-success';
  if (uploadStatus.value.includes('失败')) return 'status-error';
  return '';
});

// --- 方法 ---

// 触发隐藏的 file input 点击事件
function triggerFileInput() {
  fileInputRef.value.click();
}
// 打开弹窗
function openwindow() {
  isshoow.value = true;
}
// 关闭弹窗
function closewindow() {
  isshoow.value = false
}

// 当用户选择了文件后触发
function handleFileChange(event) {
  const file = event.target.files[0];
  if (!file) {
    removeImage();
    return;
  }

  // 简单的文件类型验证
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    alert('请选择有效的图片文件 (JPG, PNG, GIF)！');
    return;
  }

  selectedFile.value = file;
  // 生成本地预览 URL
  imagePreviewUrl.value = URL.createObjectURL(file);
  uploadStatus.value = ''; // 重置状态
}

// 移除选中的图片
function removeImage() {
  selectedFile.value = null;
  imagePreviewUrl.value = '';
  // 重置 input 的值，这样用户可以再次选择同一个文件
  if(fileInputRef.value) {
    fileInputRef.value.value = '';
  }
}

// 执行上传操作
async function uploadImage() {
  if (!selectedFile.value) {
    alert('请先选择一个图片！');
    return;
  }

  isLoading.value = true;
  uploadStatus.value = '正在上传...';

  // 1. 创建 FormData 对象
  const formData = new FormData();
  // 'file' 是一个 key，后端需要通过这个 key 来获取文件
  // 这个 key 的名字需要和后端约定好
  formData.append('file', selectedFile.value); 

  // 也可以添加其他数据
  // formData.append('userId', '123_user');

  try {
    // 2. 发送 POST 请求
    // **重要**: 请将这里的 URL 替换成你自己的后端上传接口地址
    const response = await axios.post('http://localhost:3000/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data' // axios 会自动设置，但明确写出更好
      }
    });

    // 3. 处理成功响应
    console.log('上传成功:', response.data);
    // uploadStatus.value = `上传成功！图片地址: ${response.data.url}`;
    alert(`上传成功！\n 图片地址为: ${response.data.url}`)
    
    // 上传成功后可以清空选择，以便下次上传
    // removeImage();

  } catch (error) {
    // 4. 处理错误
    console.log('上传失败:', error);
    uploadStatus.value = '上传失败，请稍后重试。';
  } finally {
    // 5. 无论成功失败，都结束加载状态
    isLoading.value = false;
  }
}
</script>

<style scoped>
.isshoow {
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  position:fixed;
  top:0;
  left:0;
  display: flex;
  justify-content: center;
  align-items: center;
}
.isshoow .center{
  width: 80%;
  height: 70%;
  background-color: #fff;
  /* text-align: center; */
}
.isshoow .center button:hover{
  cursor: pointer;
}
.isshoow .center .head{
  width: 100%;
  height: 10%;
  /* background-color: #e6c0c0; */
  text-align: center;
  font-size: 30px;
}
.isshoow .center .head button{
  width: 60px;
  height: 100%;
  float: right;
  border:none;
  background-color: #fff;
}
.isshoow .center .head button:hover{
  cursor: pointer;
}
.isshoow .center .body{
  height: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.isshoow .center .body button{
  width: 100px;
  height: 40px;
  float: left;
  margin-left: 30px;
}
/* 图片预览区域 */
.isshoow .center .image-preview{
  width: 100%;
  height: 80%;
  /* border: 1px solid red; */
}
.isshoow .center .image-preview button{
  width: 30px;
  height: 10%;
  float: right;
}
.isshoow .center .image-preview img{
  width: 100%;
  height: 100%;
  /* height: 300px; */
}
</style>
