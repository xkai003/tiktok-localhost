<!-- 未登录 (Status: 0) -->
<template>
  <div class="box">
      <button @click="showzero = !showzero" style="background-color: black; color: #fff;">
        未登陆 ({{ statezero.length }})
      </button>
      <!-- ✅ 最佳实践 2: v-show 控制容器的显示/隐藏 -->
      <div v-show="showzero">
        <!-- ✅ 最佳实践 3: v-for 用在需要重复的元素上 -->
        <div class="text" v-for="item in statezero" :key="item.id">
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
      </div>
    </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'Index',
  data() {
    return {
      // ... data 属性不变 ...
      showadd: false,
      showzero: false,
      showone: false,
      showtwo: false,
      showthree: false,
      showfour: false,
      statusMap: { '0': '未登陆', '1': '登陆成功', '2': '频繁登陆', '3': '登陆失败', '4': '封号' },
      statezero: [],
      stateone: [],
      statetwo: [],
      statethree: [],
      statefour: []
    }
  },
  async created() {
    try {
      // const res = await axios.get('/api/data');
      const res = await axios.get('http://localhost:3001/data');
      console.log('服务器返回的原始响应:', res); // 保留这个，以后调试都有用
      // ✅ 关键修改在这里！
      // 直接使用 res.data，因为它就是我们需要的数组
      const dataList = res.data; 
      if (Array.isArray(dataList)) {
        for (const item of dataList) {
          switch (item.status) {
            case '0': this.statezero.push(item); break;
            case '1': this.stateone.push(item); break;
            case '2': this.statetwo.push(item); break;
            case '3': this.statethree.push(item); break;
            case '4': this.statefour.push(item); break;
          }
        }
      } else {
        // 如果修改后还报错，说明服务器返回的可能不是数组也不是我们想的任何东西
        console.error("获取的数据格式不正确，期望 res.data 是一个数组，但实际收到了:", dataList);
      }
    } catch (error) {
      console.error('请求失败:', error);
    }
  },
  methods: {
    // 显示弹窗
    change() {
      this.showadd = true
      console.log('打开了弹窗！')
    },
    // 隐藏弹窗
    hidePopup() {
      this.showadd = false
      console.log('关闭了弹窗！')
    },
    // 
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
    // 在 StateZero.vue 的 methods 中...
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
    }
  }
}
</script>

<style>
/* ===== 单个卡片：.box ===== */
.row .box {
    /* flex: 1 1 600px; */
    /* flex布局 */
    display: flex;
    flex-direction: column; /* 内部元素（文本、按钮）垂直排列 */

    /* min-height: 220px; 设置一个最小高度，保持视觉上的对齐 */
    padding: 20px;
    border-radius: 10px;
    border-color: rgb(129, 129, 129);
    /* background-color: rgba(rgb(233, 154, 154)); */
    background-color: #fff;  /*添加背景色，让阴影更明显 */
    
    /* 提供一个平滑的过渡效果 */
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.row .box:hover { 
    /* border-color: red; */
    box-shadow: 0 10px 20px -5px rgba(136, 131, 131, 0.5); /* 优化了阴影效果，更柔和 */

}
.row .box button{
  font-size: 30px;
  height: 60px;
  border: 1px solid rgba(136, 131, 131, 0.5);
  border-radius: 10px;
  color: #fff;
  /* color: #ee9b58; */
}
.row .box button:hover{
  cursor: pointer; 
}
/* ===== 卡片内部文本区域 ===== */
/*  */
.row .box .text {
  margin-top: 20px;
  border: 1px solid rgb(155, 154, 154);
  border-radius: 15px;
  padding: 20px;
    display: flex;
    flex-direction: row; /* 左右两栏水平排列 */
    gap: 15px; /* 左右两栏之间的间距 */
}

.row .box .text .left,
.row .box .text .right {
    display: flex;
    flex-direction: column;
    gap: 8px; /* 每行文字之间的垂直间距 */
}

.row .box span {
    /* 使用 clamp() 实现响应式字体大小
       clamp(最小值, 理想值, 最大值)
       字体大小最小为14px，最大为16px，并会根据屏幕宽度在两者间平滑过渡
    */
    font-size: clamp(14px, 1.5vw, 16px);
    font-weight: bold;
    max-width: 20ch;  /*用 ch 单位设置宽度 (20ch 约等于 20个字符的宽度) */
    white-space: nowrap;      /* 1. 强制文本不换行 */
    overflow: hidden;         /* 2. 隐藏超出容器的部分 */
    text-overflow: ellipsis;  /* 3. 将被隐藏的部分显示为省略号 */
}
.row .box.text .right span{
    font-family: monospace; /* 使用等宽字体 */
} 
.row .box .text .left span {
    color: #555;
    white-space: nowrap; /* 确保标签不换行 */
}

.row .box .text .right .state span {
    font-weight: normal; /* 右侧内容通常不需要加粗 */
    color: #333;
}
.row .box .text .right .state select{
    margin: left;
    margin-left: 10px;
}

/* ===== 按钮区域 ===== */
.row .box .btn {
    /* 这个技巧非常有用！它会将按钮推到卡片的底部 */
    margin-top: auto; 
    /* 给按钮区域和上面的文字一些间距 */
    padding-top: 15px;
    display: flex;
    flex-wrap: wrap; /* 如果按钮太多，也允许换行 */
    gap: 8px; /* 按钮之间的间距 */
}

.row .box .btn button {
  height: 40px;
  /* width: 126px; */
    /* padding: 2px 2px;按钮内边距 */
    font-size: 14px;/* 按钮字体大小 */
    color: #505d69;/* 按钮字体颜色 */
    background-color: #fff;/* 按钮背景颜色 */
    border: 1px solid #ccc;/* 按钮边框 */
    border-radius: 5px;/* 按钮边框圆角 */
    cursor: pointer;/* 鼠标变成小手 */
    transition: background-color 0.2s, color 0.2s;/* 鼠标移入移出按钮时的背景过渡效果 */
}

.row .box .btn button:hover {
    color: #fff;/* 鼠标停留时按钮字体颜色 */
    background-color: #747373;/* 鼠标停留时按钮背景颜色 */
    border-color: #747373;/* 鼠标停留时按钮边框颜色 */
}
</style>