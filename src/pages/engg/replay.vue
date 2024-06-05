<template>
  <section class="page-wrapper">
    <div class="controller-wrapper">
      <Controller
        v-model:play-rate="playRate"
        :is-play="isPlay"
        :current-duration="currentDuration"
        :total-duration="totalDuration"
        @upload="upload"
        @play-state-change="onPlayChange"
        @current-duration-change="currentDurationChange"
      />
    </div>
    <div :id="CANVAS_ID" class="canvas-wrapper"></div>
    <div class="monitor-wrapper">
      <Monitor :memory="EnggRender.renderer.info.memory" />
    </div>
  </section>
</template>
<script lang="ts" setup>
import { PLAY_RATE } from "@/config/replay";
import EnggRender from "@/renderer/Pro";
import emitter from "@/utils/emitter";
import { LocalPlay } from "@/utils/replay/local";
import { RemotePlay } from "@/utils/replay/remote";
import type { PlayState } from "@/utils/replay/type";

// const route = useRoute();

const CANVAS_ID = "canvas_id";

const currentDuration = ref(0);
const totalDuration = ref(0);

const isPlay = ref(false);
const playRate = ref(PLAY_RATE);

let player: LocalPlay | RemotePlay | null = null;

const upload = async (fileList: FileList) => {
  player = new LocalPlay();
  player.init(fileList);
};

const durationchange = (duration: number) => {
  totalDuration.value = duration;
};

const timeupdate = (current: number) => {
  if (!isPlay.value) return;
  currentDuration.value = current;
};

const playStateChange = (state: PlayState) => {
  isPlay.value = state === "play";
};

const currentDurationChange = (current: number) => {
  isPlay.value = false;
  currentDuration.value = current;
  player?.postMessage({
    type: "timeupdate",
    data: {
      currentDuration: current
    }
  });
};

const onPlayChange = (val: boolean) => {
  isPlay.value = val;
  if (val) {
    player?.postMessage({
      type: "play",
      data: {
        currentDuration: currentDuration.value
      }
    });
  } else {
    player?.postMessage({ type: "pause" });
  }
};

// const loadFile = () => {
//   if (route.query.prefix) {
//     const url = `http://datapro.senseauto.com/api/data/aws/listAnonymous`;
//     const params = {
//       path: route.query.prefix,
//       bucketName: route.query.bucket
//     };
//   }
// };

onMounted(() => {
  EnggRender.initialize(CANVAS_ID);
  emitter.on("durationchange", durationchange);
  emitter.on("timeupdate", timeupdate);
  emitter.on("playState", playStateChange);
});

onBeforeUnmount(() => {
  EnggRender.dispose();
  player?.dispose();
  player = null;
  emitter.off("durationchange", durationchange);
  emitter.off("timeupdate", timeupdate);
  emitter.off("playState", playStateChange);
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
