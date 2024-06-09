<template>
  <section class="panel-wrapper">
    <div class="panel-row">
      <span>js内存: {{ formatBytes(usedMemory) }}</span>
      <span>内存占比: {{ memoryRatio.toFixed(2) }}%</span>
    </div>
    <div class="panel-row">
      <span>WebGL: {{ geometries }}/{{ textures }}</span>
      <span :class="{ 'multi-online': ips.length > 1 }">
        <el-tooltip>
          <template #content>
            <div v-for="(item, index) in ips" :key="index">
              {{ item }}
            </div>
          </template>
          实时在线: {{ ips.length }}
        </el-tooltip>
      </span>
    </div>
  </section>
</template>
<script lang="ts" setup>
import type { WebGLInfo } from "three";

import { formatBytes } from "@/utils";
import stats from "@/utils/stats";

const props = defineProps<{
  memory: WebGLInfo["memory"];
  ips: string[];
}>();

const usedMemory = ref(0);
const geometries = ref(0);
const textures = ref(0);
const memoryRatio = ref(0);

onMounted(() => {
  stats.on("memory", (memory) => {
    usedMemory.value = memory.usedJSHeapSize;
    memoryRatio.value = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    geometries.value = props.memory.geometries;
    textures.value = props.memory.textures;
  });
});

onBeforeUnmount(stats.dispose);
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
