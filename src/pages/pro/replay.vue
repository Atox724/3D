<template>
  <section class="page-wrapper">
    <div class="controller-wrapper">
      <Controller
        v-model:play-rate="playRate"
        v-model:current-duration="currentDuration"
        v-model:is-play="isPlay"
        :total-duration="1000000"
      />
    </div>
    <div :id="CANVAS_ID" class="canvas-wrapper"></div>
    <div class="monitor-wrapper">
      <Monitor :memory="ProRender.renderer.info.memory" />
    </div>
  </section>
</template>
<script lang="ts" setup>
import { PLAY_RATE } from "@/config/replay";
import ProRender from "@/renderer/Pro";

const CANVAS_ID = "canvas_id";

const currentDuration = ref(0);

const isPlay = ref(false);
const playRate = ref(PLAY_RATE);

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

  .controller-wrapper {
    position: absolute;
    left: 0;
    top: 20px;
    width: 50%;
    transform: translateX(50%);
  }

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
