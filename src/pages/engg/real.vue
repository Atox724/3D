<template>
  <section class="page-wrapper">
    <div :id="CANVAS_ID" class="canvas-wrapper"></div>
    <div class="monitor-wrapper">
      <Monitor
        :memory="EnggRender.renderer.info.memory"
        :ips="EnggRender.ips"
      />
    </div>
  </section>
</template>
<script lang="ts" setup>
import EnggRender from "@/renderer/Engg";

const CANVAS_ID = "canvas_id";

onMounted(() => {
  EnggRender.initialize(CANVAS_ID);
});

onBeforeUnmount(() => {
  EnggRender.dispose();
});
</script>
<style lang="less" scoped>
.page-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;

  .canvas-wrapper {
    width: 100%;
    height: 100%;
  }

  .monitor-wrapper {
    position: absolute;
    right: 0;
    bottom: 0;
  }
}
</style>
