<template>
  <section class="controller">
    <span class="duration">
      {{ formatTime(currentDuration) }}
    </span>
    <el-slider
      v-model="progress"
      class="progress-bar"
      :show-tooltip="false"
      @change="
        emits(
          'update:currentDuration',
          (($event as number) * totalDuration) / 100
        )
      "
    />
    <span class="duration">
      {{ formatTime(totalDuration) }}
    </span>
    <el-space style="margin-left: 18px" :size="18">
      <el-icon
        size="24"
        class="play-btn"
        @click="emits('update:isPlay', !isPlay)"
      >
        <VideoPlay v-if="isPlay" />
        <VideoPause v-else />
      </el-icon>
      <el-dropdown @command="emits('update:playRate', $event)">
        <span class="el-dropdown-link">
          {{
            playRateOptions.find((item) => item.value === playRate)?.label ||
            playRate
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
      <el-button @click="emits('upload')">Upload</el-button>
    </el-space>
  </section>
</template>
<script lang="ts" setup>
import { ArrowDown, VideoPause, VideoPlay } from "@element-plus/icons-vue";

import { formatTime } from "@/utils";

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

const props = defineProps<{
  currentDuration: number;
  totalDuration: number;
  isPlay: boolean;
  playRate: number;
}>();

const emits = defineEmits<{
  (e: "update:currentDuration", progress: number): void;
  (e: "update:isPlay", isPlay: boolean): void;
  (e: "update:playRate", rate: number): void;
  (e: "upload"): void;
}>();

const progress = ref(0);

watchEffect(() => {
  progress.value = (props.currentDuration / props.totalDuration) * 100;
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
