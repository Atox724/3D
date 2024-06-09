<template>
  <section class="page-wrapper">
    <div class="controller-wrapper">
      <Controller
        :is-play="isPlay"
        :current-duration="currentDuration"
        :total-duration="totalDuration"
        :show-upload="!route.query.path"
        :load-progress="loadProgress"
        @upload="upload"
        @play-state-change="onPlayChange"
        @play-rate-change="onPlayRateChange"
        @current-duration-change="onCurrentDurationChange"
      />
    </div>
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
import { LocalPlay } from "@/utils/replay/local";

const route = useRoute();

const CANVAS_ID = "canvas_id";

const player = new LocalPlay();

// if (route.query.path) {
//   player = new RemotePlay();
//   player.init("/api", route.query);
// } else {
//   player = new LocalPlay();
// }

const currentDuration = ref(0);
const totalDuration = ref(0);
const loadProgress = ref(0);
const isPlay = ref(false);

const upload = async (fileList: FileList) => {
  player.init(Array.from(fileList));
};

const onPlayChange = (val: boolean) => {
  isPlay.value = val;
  if (val) {
    player.postMessage({
      type: "playstate",
      data: {
        state: "play",
        currentDuration: currentDuration.value
      }
    });
  } else {
    player.postMessage({
      type: "playstate",
      data: {
        state: "pause"
      }
    });
  }
};

const onPlayRateChange = (rate: number) => {
  player.postMessage({
    type: "rate",
    data: rate
  });
};

const onCurrentDurationChange = (current: number) => {
  isPlay.value = false;
  currentDuration.value = current;
  player.postMessage({
    type: "timeupdate",
    data: {
      currentDuration: current
    }
  });
};

onMounted(() => {
  EnggRender.initialize(CANVAS_ID);
  player.on("durationchange", (data) => {
    totalDuration.value = data.endTime - data.startTime;
  });
  player.on("timeupdate", (data) => {
    currentDuration.value = data.currentDuration;
  });
  player.on("playstatechange", (data) => {
    isPlay.value = data === "play";
  });
  player.on("loadstate", (data) => {
    loadProgress.value =
      Math.round((data.current / data.total) * 100 * 1e4) / 1e4;
  });
});

onBeforeUnmount(() => {
  EnggRender.dispose();
  player.dispose();
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
