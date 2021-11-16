<template>
  <el-card class='box-card'>
    <div slot='header' class='clearfix' v-if='$slots.header'>
      <slot name='header'></slot>
    </div>
    <slot></slot>
  </el-card>
</template>

<script>
export default {
  name: 'UiCard',
  data() {
    return {}
  },
  methods: {},
}
</script>

<style scoped lang='scss'>

</style>