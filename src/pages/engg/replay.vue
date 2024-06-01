<template>
  <section class="page-wrapper">
    <div class="controller-wrapper">
      <Controller
        v-model:play-rate="playRate"
        v-model:current-duration="currentDuration"
        v-model:is-play="isPlay"
        :total-duration="totalDuration"
        @upload="upload"
      />
    </div>
    <div :id="CANVAS_ID" class="canvas-wrapper"></div>
    <div class="monitor-wrapper">
      <Monitor :memory="EnggRender.renderer.info.memory" />
    </div>
  </section>
</template>
<script lang="ts" setup>
import { throttle } from "lodash-es";

import { PLAY_RATE } from "@/config/replay";
import EnggRender from "@/renderer/Pro";
import emitter from "@/utils/emitter";
import {
  readFileAsText,
  readFileFirstRow,
  readFileLastRow
} from "@/utils/file";
import { ReplayWorker } from "@/utils/replay";

const replayWorker = new ReplayWorker();

const CANVAS_ID = "canvas_id";

const currentDuration = ref(0);
const totalDuration = ref(0);

const isPlay = ref(false);
const playRate = ref(PLAY_RATE);

const upload = async (fileList: FileList) => {
  const files = Array.from(fileList);
  files.sort((a, b) => a.name.localeCompare(b.name));
  const firstFile = files[0];
  const lastFile = files[files.length - 1];

  const startRow = await readFileFirstRow(firstFile);
  const endRow = await readFileLastRow(lastFile);

  const startTime = +startRow.split(":")[0];
  const endTime = +endRow.split(":")[0];

  totalDuration.value = (endTime - startTime) / 1000;

  replayWorker.sendMessage({
    type: "time",
    data: {
      startTime,
      endTime
    }
  });

  isPlay.value = true;

  replayWorker.sendMessage({
    type: "status",
    data: {
      status: "play"
    }
  });

  for (const file of files) {
    const data = await readFileAsText(file);
    replayWorker.sendMessage({
      type: "data",
      data
    });
  }
};

const updateDuration = throttle((data: any) => {
  currentDuration.value = data.delay;
}, 1000);

onMounted(() => {
  EnggRender.initialize(CANVAS_ID);
  emitter.on("data", updateDuration);
});

onBeforeUnmount(() => {
  EnggRender.dispose();
  emitter.off("data", updateDuration);
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
