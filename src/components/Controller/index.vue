<template>
  <section class="controller">
    <span class="duration">
      {{ formatTime(currentDuration) }}
    </span>
    <el-slider
      v-model="progress"
      :show-tooltip="false"
      :style="{ '--loaded-width': `${loadProgress}%` }"
      class="progress-bar"
      @change="progressChange($event as number)"
      @input="progressInput($event as number)"
    />
    <span class="duration">
      {{ formatTime(totalDuration) }}
    </span>
    <el-space style="margin-left: 18px" :size="18">
      <el-icon
        size="24"
        class="play-btn"
        @click="emits('playStateChange', !isPlay)"
      >
        <VideoPlay v-if="!isPlay" />
        <VideoPause v-else />
      </el-icon>
      <el-dropdown @command="playRateChange">
        <span class="el-dropdown-link">
          {{ playRateOptions.find((item) => item.value === rate)?.label || rate
          }}<el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-item
            v-for="item in playRateOptions"
            :key="item.value"
            :command="item.value"
            >{{ item.label }}</el-dropdown-item
          >
        </template>
      </el-dropdown>
      <el-button v-if="showUpload" @click="upload">Upload</el-button>
    </el-space>
  </section>
</template>
<script lang="ts" setup>
import { ArrowDown, VideoPause, VideoPlay } from "@element-plus/icons-vue";

import { formatTime } from "@/utils";
import { chooseFile } from "@/utils/file";

const playRateOptions = [
  {
    label: "x0.25",
    value: 0.25
  },
  {
    label: "x0.5",
    value: 0.5
  },
  {
    label: "x1.0",
    value: 1
  },
  {
    label: "x1.5",
    value: 1.5
  },
  {
    label: "x2.0",
    value: 2
  }
];

const props = withDefaults(
  defineProps<{
    currentDuration?: number;
    totalDuration?: number;
    isPlay?: boolean;
    playRate?: number;
    showUpload?: boolean;
    loadProgress?: number;
  }>(),
  {
    currentDuration: 0,
    totalDuration: 0,
    isPlay: false,
    playRate: 1,
    showUpload: false,
    loadProgress: 0
  }
);

const emits = defineEmits<{
  (e: "playRateChange", rate: number): void;
  (e: "playStateChange", isPlay: boolean): void;
  (e: "currentDurationChange", currentDuration: number): void;
  (e: "upload", files: FileList): void;
}>();

const progress = ref(0);

const progressChanging = ref(false);

watchEffect(() => {
  if (progressChanging.value) return;
  progress.value = (props.currentDuration / props.totalDuration) * 100;
});

const progressInput = (val: number) => {
  progressChanging.value = true;
  progress.value = val;
};

const progressChange = (val: number) => {
  progressChanging.value = false;
  emits("currentDurationChange", (val / 100) * props.totalDuration);
};

const rate = ref(props.playRate);

const playRateChange = (val: number) => {
  emits("playRateChange", val);
  rate.value = val;
};

const upload = async () => {
  const files = await chooseFile({ directory: true });
  if (files) {
    emits("upload", files);
  }
};

watchEffect(() => {
  rate.value = props.playRate;
});
</script>
<style lang="less" scoped>
.controller {
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  color: #fff;
  padding: 12px 20px;
  border-radius: 16px;

  .duration {
    background-color: #444444;
    border-radius: 4px;
    padding: 4px;
  }

  .progress-bar {
    flex: 1;
    padding: 0 18px;

    :deep(.el-slider__runway) {
      &::before {
        content: "";
        position: absolute;
        display: block;
        width: var(--loaded-width);
        height: var(--el-slider-height);
        background-color: var(--el-slider-main-bg-color);
        opacity: 0.5;
        transition: width 0.3s ease;
      }
    }
  }

  .play-btn {
    cursor: pointer;

    &:hover {
      color: var(--el-color-primary);
    }
  }

  .el-dropdown-link {
    all: unset;
    cursor: pointer;
    color: #fff;
    display: flex;
    align-items: center;

    &:hover {
      color: var(--el-color-primary);
    }
  }
}
</style>
