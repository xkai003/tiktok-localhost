<!-- 状态：已重构为客户端 -->
 <!-- ddd -->
<template>
  <div class="box">
    <!-- 这个按钮保持不变 -->
    <button @click="change()" style="background-color: #ff5722; color: #fff;">
      添加
    </button>
    <!-- 弹窗 -->
    <div class="showadd" v-show="showadd">
      <div class="addtxt">
        <span>请按 要求的格式输入内容</span>
        <textarea placeholder="一行一条记录，例如：&#10;user001|pass123|e1@a.com|epass1|US&#10;user002|pass456|e2@b.com|epass2|UK" v-model="textToAdd"></textarea>
        <div>
          <button @click="determine()">确定</button>
          <button @click="hidePopup()">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>



<script>
export default {
  name: 'AddData',
  data() {
    return {
      showadd: false,
      textToAdd: '' 
    }
  },
  methods: {
    // 显示弹窗
    change() {
      this.showadd = true;
      this.textToAdd = ''; // 每次打开时清空
    },
    // 隐藏弹窗
    hidePopup() {
      this.showadd = false;
    },
    // 确定动作：解析文本、发送数据、处理结果
    async determine() {
      // 检查输入是否为空
      if (!this.textToAdd.trim()) {
        alert('请输入内容！');
        return;
      }

      // 1. 将文本按行分割，并过滤掉可能存在的空行
      const lines = this.textToAdd.trim().split('\n').filter(line => line.trim() !== '');
      
      console.log(`准备处理 ${lines.length} 条记录...`);
      let allSucceeded = true;

      // 2. 遍历每一行，为每一行都发送一个独立的请求
      for (const line of lines) {
        // 3. 将每一行按 '|' 分割成多个部分
        const parts = line.split('|');

        // 4. 重要：验证格式是否正确（必须是5个部分）
        if (parts.length !== 5) {
          alert(`格式错误，请检查该行：\n"${line}"\n\n正确的格式应为: user|password|email|emailPwd|country`);
          allSucceeded = false;
          break; // 停止处理后续行
        }

        // 5. 创建要发送到服务器的纯数据对象
        // 注意：这里不包含 id 和 status，这些由后端负责！
        const dataToSend = {
          id: String(Date.now()),
          status: "0",
          user: parts[0].trim(),
          password: parts[1].trim(),
          email: parts[2].trim(),
          emailPwd: parts[3].trim(),
          country: parts[4].trim(),
        };

        try {
          // 6. 发送 POST 请求
          const response = await fetch('http://localhost:3001/data/', { // 请确保这是你正确的API地址
            method: 'POST',
            headers: {
              'Content-Type': 'application/json', // 必须有这个头，告诉服务器我们发送的是JSON
            },
            // 将我们的数据对象转换为 JSON 字符串，并放在 body 里发送
            body: JSON.stringify(dataToSend),
          });

          if (!response.ok) {
            // 如果服务器返回错误（如 400, 500 等）
            const errorText = await response.text();
            throw new Error(`服务器处理失败: ${response.status} - ${errorText}`);
          }

          // 解析后端返回的、包含完整信息（带id和status）的对象
          const newRecord = await response.json();
          console.log('添加成功，后端返回的完整记录:', newRecord);
          alert('添加成功')
        // 添加数据完成后重新刷新页面
        location.reload();
          

          // 7. 使用 $emit 通知父组件有新数据了！
          // 父组件会接收到这个完整的 newRecord 对象
          this.$emit('data-added', newRecord);

        } catch (error) {
          console.error('请求失败:', error);
          alert(`添加数据 "${dataToSend.user}" 时发生错误: ${error.message}`);
          allSucceeded = false;
          break; // 发生网络或服务器错误，也停止处理
        }
      }

      // 8. 如果所有行都成功处理，则关闭弹窗
      if (allSucceeded) {
        console.log("所有记录处理完毕！");
        this.hidePopup();
      }
    }
  }
}
</script>


<!-- 样式部分保持不变 -->
<style scoped>
.box{
  width: 50%;
  height: 60px;
  /* height: 300px; */
  /* border: 1px solid red; */
  float: left;
}
.box button{
  font-size: 30px;
  height: 60px;
  border: 1px solid rgba(136, 131, 131, 0.5);
  border-radius: 10px;
  color: #fff;
}
.box button:hover{
  cursor: pointer; 
}
.box .showadd{
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2);
}
.box .addtxt{
  width: 100%;
  height: 70%;
  background-color: #fff;
  position: fixed;
  top: 10%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.box .addtxt span{
  font-size: 15px;
}
.box .addtxt textarea{
  width: 90%;
  height: 80%;
  margin-top: 10px;
  padding: 10px;
}
.box .addtxt button{
  width: 100px;
  height: 40px;
  margin: 10px;
  margin-left: 30px;
  font-size: x-small;
  color: black;
}
</style>
