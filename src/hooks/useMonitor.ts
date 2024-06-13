import type Renderer from "@/renderer/renderer";

export const useMonitor = (renderer: Renderer) => {
  const fps = ref(-1);
  const memory = ref<Memory>();
  const geometries = ref(0);
  const textures = ref(0);

  onMounted(() => {
    renderer.stats.on("fps", (val) => {
      fps.value = val;
      geometries.value = renderer.renderer.info.memory.geometries;
      textures.value = renderer.renderer.info.memory.textures;
      // FIX: fps值没变化时不会触发图表更新
      nextTick(() => (fps.value = -1));
    });
    renderer.stats.on("memory", (val) => {
      memory.value = val;
    });
  });

  onBeforeUnmount(() => {
    renderer.stats.dispose();
  });

  return { fps, memory, geometries, textures };
};
