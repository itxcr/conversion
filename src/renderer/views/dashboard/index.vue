<template>
  <div style='position: absolute;left: 0;top: 0;'>
    首页
    <el-button @click="$router.go(-1)">返回</el-button>
  </div>
</template>

<script>

export default {
  name: 'Dashboard',
  data() {
    return {
      currentRole: 'adminDashboard',
    }
  },
}
</script>
