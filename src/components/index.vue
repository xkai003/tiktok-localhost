<template>
  <div class="row">
    <!-- 操作导航 -->
    <TopComponents></TopComponents>
    <!-- 添加二维码 -->
    <AddQRCode></AddQRCode>
    <!-- 未登录 (Status: 0) -->
    <state-zero></state-zero>
    <!-- 登陆成功 (Status: 1) -->
    <state-one></state-one>
    <!-- 频繁登陆 (Status: 2) -->
    <state-two></state-two>
    <!-- 登陆失败 (Status: 3) -->
    <state-three></state-three>
    <!-- 封号 (Status: 4) -->
    <state-four></state-four>
  </div>
</template>

<script>
import axios from 'axios';
// 导入组件
import AddQRCode from './AddQRCode.vue';
import TopComponents from './TopComponents.vue';
import AddData from './AddData.vue';
import SearchData from './SearchData.vue'
import StateZero from './StateZero.vue';
import StateOne from './StateOne.vue';
import StateTwo from './StateTwo.vue';
import StateThree from './StateThree.vue';
import StateFour from './StateFour.vue';
export default {
  name: 'Index',
  components: {
    AddQRCode,
    TopComponents,
    AddData,
    SearchData,
    StateZero,
    StateOne,
    StateTwo,
    StateThree,
    StateFour
  }
}
</script>

<style scoped>


</style>