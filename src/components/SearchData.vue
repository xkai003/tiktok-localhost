<template>
  <div class="box">
    <!-- 这个按钮保持不变 -->
    <button @click="change()" style="background-color: #ff5722; color: #fff;">
      搜索
    </button>

    <!-- 弹窗 -->
    <div class="showadd" v-show="showadd">
      <div class="addtxt">
        <div class="content">
          <div class="title">
            <span>搜索栏</span>
            <button @click="hidePopup()" class="tc">x</button>
          </div>

          <div class="head">
            <input type="text" v-model="searchinp" placeholder="请输入你要搜索的账号">
          </div>

          <div class="body">
            <!-- 用 v-for 渲染每一条数据 -->
            <div class="text" v-for="(item, idx) in filteredList" :key="idx">
              <div class="left">
                <span>账号:</span>
                <span>账号密码:</span>
                <span>邮箱:</span>
                <span>邮箱密码:</span>
                <span>国家:</span>
                <span>状态:</span>
              </div>
              <div class="right">
                <span>{{ item.user }}</span>
                <span>{{ item.password }}</span>
                <span>{{ item.email }}</span>
                <span>{{ item.emailPwd }}</span>
                <span style="color: red;">{{ item.country }}</span>
                <div class="state">
                  <!-- ✅ 最佳实践 4: 使用 statusMap 将代码转为文本 -->
                  <span :class="`status-${item.status}`">{{ statusMap[item.status] }}</span>
                  <select @change="changeStatus(item, $event)">
                    <option value="" disabled selected>更改状态</option>
                    <option value="1">登陆成功</option>
                    <option value="3">登陆失败</option>
                    <option value="2">频繁登陆</option>
                    <option value="4">封号</option>
                  </select>
                </div>
                <div class="btn">
              <!-- ✅ 最佳实践 5: 使用 @click 绑定Vue方法，并传递数据 -->
              <button @click="copy(item.user, $event.target)">复制账号</button>
              <button @click="copy(item.password, $event.target)">复制账号密码</button>
              <button @click="copy(item.email, $event.target)">复制邮箱</button>
              <button @click="copy(item.emailPwd, $event.target)">复制邮箱密码</button>
            </div>
              </div>
            </div>

            <!-- 无数据提示 -->
            <div v-if="!loading && filteredList.length === 0" style="text-align:center;color:#999;">
              暂无匹配数据
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'AddData',
  data() {
    return {
      showadd: false,// 控制弹窗显示隐藏
      searchinp: '', // v-model 双向数据绑定搜索框
      list: [],        // 存放后端原始数据
      // loading: false
      statusMap: { '0': '未登陆', '1': '登陆成功', '2': '频繁登陆', '3': '登陆失败', '4': '封号' },
    }
  },
  computed: {
    // 模糊匹配：账号 / 邮箱 / 国家
    filteredList() {
      // 如果搜索框没有内容，则返回空
      if (!this.searchinp.trim()) {
        return 0
      }

      // 定义变量获取搜索框的内容并去掉首尾空
      const kw = this.searchinp.trim()
      return this.list.filter(
        (i) =>
          i.user?.includes(kw) ||
          i.email?.includes(kw) ||
          i.country?.includes(kw)
      )
    }
  },
  methods: {
    change() {
      this.showadd = true
      this.searchinp = ''
    },
    hidePopup() {
      this.showadd = false
    },
    async search() {
      if (!this.list.length) await this.fetchData()
      // 计算属性已自动完成过滤，无需额外操作
    },
    async fetchData() {
      this.loading = true
      try {
        const { data } = await axios.get('http://localhost:3001/data')
        this.list = Array.isArray(data) ? data : []
      } catch (e) {
        console.error('请求失败：', e)
      } finally {
        this.loading = false
      }
    },
    // 更改状态
    async changeStatus(item, event) {
  const newStatus = event.target.value;
  const newStatusText = this.statusMap[newStatus];
  alert(`你正试图将账号 ${item.user} 的状态更新为: ${newStatusText}(${newStatus})`);
  // === 在这里添加调试代码 ===
  console.log('准备发送给后端更新的数据:', item);
  console.log('要更新的ID是:', item.id);
  try {
    // 1. 发送请求到后端更新数据
    await axios.put(`http://localhost:3001/data/${item.id}`, {
      ...item, // 复制 item 的所有旧属性
      status: newStatus // 覆盖 status 属性为新值
    });
    // 2. === 关键步骤：在前端手动移动数据 ===
    // 2.1 从旧的数组中移除该项
    const oldStatus = item.status;
    let sourceArray;
    switch (oldStatus) {
      case '0': sourceArray = this.statezero; break;
      case '1': sourceArray = this.stateone; break;
      case '2': sourceArray = this.statetwo; break;
      case '3': sourceArray = this.statethree; break;
      case '4': sourceArray = this.statefour; break;
    }
    if (sourceArray) {
      const index = sourceArray.findIndex(i => i.id === item.id);
      if (index !== -1) {
        sourceArray.splice(index, 1);
      }
    }
    // 2.2 更新该项的 status 属性
    item.status = newStatus;
    // 2.3 将更新后的项添加到新的数组中
    let targetArray;
    switch (newStatus) {
        case '0': targetArray = this.statezero; break;
        case '1': targetArray = this.stateone; break;
        case '2': targetArray = this.statetwo; break;
        case '3': targetArray = this.statethree; break;
        case '4': targetArray = this.statefour; break;
    }
    if (targetArray) {
      targetArray.push(item);
    }
    
    console.log(`账号 ${item.user} 状态更新成功！`);
  } catch (error) {
    console.error('更新状态失败:', error);
    // 如果更新失败，最好提示用户
    alert('抱歉，状态更新失败，请稍后再试。');
  }
    },
    // 复制功能
    async copy(textToCopy, buttonElement) {
      if (!textToCopy) return;
      try {
        await navigator.clipboard.writeText(textToCopy);
        const originalText = buttonElement.innerText;
        buttonElement.innerText = '复制成功!';
        buttonElement.disabled = true;
        setTimeout(() => {
          buttonElement.innerText = originalText;
          buttonElement.disabled = false;
        }, 1500);
      } catch (err) {
        console.error('复制失败: ', err);
        alert('复制失败！');
      }
    },

  },
  created() {
    this.fetchData()
  }
}
</script>



<!-- 样式部分保持不变 -->
<style scoped>
.box{
  width: 50%;
  height: 60px;
  float: left;
}
.box .showadd{
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
}
.box .addtxt{
  width: 100%;
  /* background-color: #fff; */
  position: fixed;
  top: 10%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.box .content{
  width: 80%;
  height: 100%;
  margin: 10px;
  border: 1px solid red;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  padding: 30px;

}
.box .title{
  text-align: center;
}
.box .title span{
  font-size: 30px;
  color: red;
}
.showadd .content .tc{
  width: 50px;
  height: 30px;
  font-size: 20px;
  color: black;
  float: right;
  border:none;
  background-color: #fff;
}
.box .content .head{
  width: 100%;
  height: 50px;
  margin-top: 5px;
  /* border: 1px solid gold; */
  border: none;
  display: flex;
  justify-content: center;
}
.box .content .head input{
  width: 100%;
}
.box .content .head button{
  width:30%;
  height: 100%;
  color: black;
  font-size: x-small;
  border: none;
}
/*  */
.box .content .body{
    color: rgb(93, 193, 240);
    /* 固定高度 */
    height: 550px;
    /* margin: 30px; */
    /* 关键：当内容在水平方向上溢出时，显示滚动条 */
    max-height: 550px;/* 最大高度 */
    overflow-y: auto;/* 垂直滚动条 */
  /* 为了更好的视觉效果，可以加上一些内边距 */
  /* 为了美观，可以给容器添加背景色和圆角 */
  background-color: #f0f2f5;
  /* border-radius: 4px; */
}
.box .text .right .state span {
    font-weight: normal; /* 右侧内容通常不需要加粗 */
    color: #333;
}
.box .text .right .state select{
    margin: left;
    margin-left: 10px;
}
</style>
