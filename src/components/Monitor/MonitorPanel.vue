<template>
  <section class="panel-wrapper">
    <div class="panel-row">
      <span>js内存: {{ formatBytes(usedMemory) }}</span>
      <span>内存占比: {{ memoryRatio.toFixed(2) }}%</span>
    </div>
    <div class="panel-row">
      <span>WebGL: {{ geometries }}/{{ textures }}</span>
      <span :class="{ 'multi-online': monitor.onlineList.length > 1 }">
        <el-tooltip>
          <template #content>
            <div v-for="(item, index) in monitor.onlineList" :key="index">
              {{ item }}
            </div>
          </template>
          实时在线: {{ monitor.onlineList.length }}
        </el-tooltip>
      </span>
    </div>
  </section>
</template>
<script lang="ts" setup>
import type { WebGLInfo } from "three";

import monitor from "@/store/monitor";
import { formatBytes } from "@/utils";

const props = defineProps<{
  memory: WebGLInfo["memory"];
}>();

const usedMemory = ref(0);
const geometries = ref(0);
const textures = ref(0);
const memoryRatio = ref(0);

let timer: number;
const startUpdate = () => {
  timer = setInterval(() => {
    if (window.performance.memory) {
      const { usedJSHeapSize, jsHeapSizeLimit } = window.performance.memory;
      usedMemory.value = usedJSHeapSize;
      memoryRatio.value = (usedJSHeapSize / jsHeapSizeLimit) * 100;
    }
    geometries.value = props.memory.geometries;
    textures.value = props.memory.textures;
  }, 1000);
};

const stopUpdate = () => {
  clearInterval(timer);
};

onMounted(startUpdate);

onBeforeUnmount(stopUpdate);
</script>
<style lang="less" scoped>
.panel-wrapper {
  padding: 4px;
  flex: 1;
  display: flex;
  flex-direction: column;
  font-size: 10px;
  color: #ffffff;

  .panel-row {
    display: flex;
    margin-top: 4px;

    &:first-child {
      margin-top: 0;
    }

    & span {
      flex: 1;
    }

    .multi-online {
      color: #f5222d;
      font-size: 10px;
    }
  }
}
</style>
