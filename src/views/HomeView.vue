<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js App" />
    <el-button type="primary">{{ test }}</el-button>
  </div>
</template>

<script setup>
let test = ref(1);
</script>
