<template>
  <section class="page-wrapper">
    <div :id="CANVAS_ID" class="canvas-wrapper"></div>
    <div class="monitor-wrapper">
      <Monitor
        :ips="ProRender.ips"
        v-bind="{ fps, memory, geometries, textures }"
      />
    </div>
  </section>
</template>
<script lang="ts" setup>
import { useMonitor } from "@/hooks/useMonitor";
import ProRender from "@/renderer/Pro";

const CANVAS_ID = "canvas_id";

const { fps, memory, geometries, textures } = useMonitor(ProRender);

onMounted(() => {
  ProRender.initialize(CANVAS_ID);
});

onBeforeUnmount(() => {
  ProRender.dispose();
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
