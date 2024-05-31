<template>
  <section class="monitor-wrapper">
    <MonitorChart />
    <el-divider direction="vertical" style="height: 100%"></el-divider>
    <MonitorPanel :memory="memory" />
  </section>
</template>
<script lang="ts" setup>
import type { WebGLInfo } from "three";

defineProps<{
  memory: WebGLInfo["memory"];
}>();
</script>
<style lang="less" scoped>
.monitor-wrapper {
  width: 300px;
  height: 70px;
  display: flex;
  background-color: rgba(52, 52, 52, 0.6);
  backdrop-filter: blur(4px);
}
</style>
