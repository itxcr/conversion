<template>
  <lay-out>
    <ui-dialog title='测试下插槽'>
      <template v-slot:footer>
        这是脚
      </template>
      <template v-slot:header>
        123123
      </template>
      <template v-slot:actions>
        789
      </template>
      <template v-slot:subheader>
        456
      </template>
    </ui-dialog>
  </lay-out>
</template>

<script>
import LayOut from '@/components/LayOut'
import UiDialog from '@/components/UiDialog'

export default {
  name: 'ExportKml',
  components: { LayOut, UiDialog },

}
</script>

<style scoped>

</style>