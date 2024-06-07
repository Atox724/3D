import emitter from "@/utils/replay/emitter";
import type { EventType } from "@/utils/replay/type";

export function usePlayer() {
  const currentDuration = ref(0);
  const totalDuration = ref(0);
  const loadProgress = ref(0);
  const isPlay = ref(false);

  const durationchange = (ev: EventType.DurationType["data"]) => {
    totalDuration.value = ev.endTime - ev.startTime;
  };

  const timeupdate = (ev: EventType.TimeUpdateType["data"]) => {
    if (!isPlay.value) return;
    currentDuration.value = ev.currentDuration;
  };

  const playstatechange = (ev: EventType.PlayStateType["data"]) => {
    isPlay.value = ev === "play";
  };

  const loadstatechange = (ev: EventType.LoadStateType["data"]) => {
    const { current, total } = ev;
    loadProgress.value = Math.round((current / total) * 100 * 1e4) / 1e4;
  };

  onMounted(() => {
    emitter.on("durationchange", durationchange);
    emitter.on("timeupdate", timeupdate);
    emitter.on("playstatechange", playstatechange);
    emitter.on("loadstate", loadstatechange);
  });

  onBeforeUnmount(() => {
    emitter.off("durationchange", durationchange);
    emitter.off("timeupdate", timeupdate);
    emitter.off("playstatechange", playstatechange);
    emitter.off("loadstate", loadstatechange);
  });

  return {
    currentDuration,
    totalDuration,
    loadProgress,
    isPlay
  };
}
