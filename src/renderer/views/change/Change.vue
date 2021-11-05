<template>
  <div class="home">
    <el-button @click="$router.go(-1)">返回</el-button>
    <div>
      <input type="text" v-model="lng" />
    </div>
    <div>
      <input type="text" v-model="lat" />
    </div>
    <div>
      {{ value }}
    </div>
    <button @click="generate">生成</button>
  </div>
</template>

<script>
import { BD09toGCJ02, Point } from 'coordtransform-js'

export default {
  name: 'Home',
  components: {
  },
  data() {
    return {
      lng: '117.141278',
      lat: '39.115441',
      value: '',
    }
  },
  methods: {
    generate() {
      this.value = BD09toGCJ02(new Point(this.lng, this.lat))
    },
  },
}
</script>
