<template>
  <div class="box">
    <div class="row">
      <SearchData></SearchData>
      <AddData></AddData>
    </div>
  </div>
</template>

<script>
import SearchData from './SearchData.vue';
import AddData from './AddData.vue';
export default {
  name:'TopComponents',
  components: {
    SearchData,
    AddData
  }
}
</script>

<style scoped>

.box .row{
  display: flex;
  font-size: 30px;
  border-radius: 10px;
  color: #fff;
}
</style>