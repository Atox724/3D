<template>
  <section class="page-wrapper">
    <div class="controller-wrapper">
      <Controller
        :play-state="playState"
        :current="currentDuration"
        :total="totalDuration"
        :load-progress="loadProgress"
        @play-state-change="onPlayStateChange"
        @play-rate-change="onPlayRateChange"
        @duration-change="onDurationChange"
      >
        <template #right>
          <el-button v-if="!route.query.path" @click="upload">Upload</el-button>
        </template>
      </Controller>
    </div>
    <div :id="CANVAS_ID" class="canvas-wrapper"></div>
    <div class="monitor-wrapper">
      <Monitor
        :ips="renderer.ips"
        v-bind="{ geometries, textures, memory, fps }"
      />
    </div>
  </section>
</template>
<script lang="ts" setup>
import { CANVAS_ID } from "@/constants";
import { useMonitor } from "@/hooks/useMonitor";
import VirtualRender from "@/renderer/virtual";
import type { PlayState } from "@/typings";
import { chooseFile } from "@/utils/file";
import { LocalPlay } from "@/utils/replay/local";
import { RemotePlay } from "@/utils/replay/remote";
import { VIEW_WS } from "@/utils/websocket";

const route = useRoute();

const renderer = new VirtualRender();

const { fps, memory, geometries, textures } = useMonitor(renderer);

let player: LocalPlay | RemotePlay | null = null;
if (route.query.path) {
  player = new RemotePlay();
  player.init("/api", route.query);
} else {
  player = new LocalPlay();
}

const currentDuration = ref(0);
const totalDuration = ref(0);
const loadProgress = ref(0);
const playState = ref<PlayState>("pause");

const upload = async () => {
  const fileList = await chooseFile({ directory: true });
  if (!fileList) return;
  const carPoseData = {
    topic: "car_pose",
    data: {
      data: [
        {
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 }
        }
      ]
    }
  };
  VIEW_WS.emit("car_pose", carPoseData);
  renderer.ground.position.set(0, 0, 0);
  renderer.ground.rotation.z = 0;
  (player as LocalPlay).init(Array.from(fileList));
};

const onPlayStateChange = (val: PlayState, current = 0) => {
  playState.value = val;
  player?.postMessage({
    type: "playstate",
    data: {
      state: val,
      currentDuration: current
    }
  });
};

const onPlayRateChange = (speed: number) => {
  player?.postMessage({
    type: "playrate",
    data: speed
  });
};

const onDurationChange = (current: number) => {
  playState.value = "pause";
  currentDuration.value = current;
  player?.postMessage({
    type: "timeupdate",
    data: current
  });
};

onMounted(() => {
  renderer.initialize(CANVAS_ID);
  player?.on("durationchange", (data) => {
    totalDuration.value = data.endTime - data.startTime;
  });
  player?.on("timeupdate", (data) => {
    if (playState.value !== "play") return;
    currentDuration.value = data;
  });
  player?.on("playstatechange", (data) => {
    playState.value = data;
  });
  player?.on("loadstate", (data) => {
    loadProgress.value =
      Math.round((data.current / data.total) * 100 * 1e4) / 1e4;
  });
});

onBeforeUnmount(() => {
  renderer.dispose();
  player?.dispose();
  player = null;
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
