import { throttle } from "lodash-es";

import { binarySearch, formatMsg } from "..";
import {
  readFileAsText,
  readFileBothRowByFile,
  readFileFirstRowByFile,
  readFileLastRowByFile
} from "../file";
import { Timer } from "./timer";
import type { LocalWorker, MaybeArray } from "./type";

const timer = new Timer();

let cacheFiles: File[] = [];

let startTime = 0,
  endTime = 0,
  totalDuration = 0,
  baselineTime = 0;

let isJump = false;

const getDuration = async () => {
  const firstFile = cacheFiles[0];
  const lastFile = cacheFiles[cacheFiles.length - 1];

  const startRow = await readFileFirstRowByFile(firstFile);
  const endRow = await readFileLastRowByFile(lastFile);

  startTime = +startRow.split(":")[0] / 1000;
  endTime = +endRow.split(":")[0] / 1000;
  totalDuration = endTime - startTime;
  baselineTime = startTime;
};

const postProgress = throttle((currentDuration: number) => {
  postMsg({
    type: "loadstate",
    data: {
      state:
        currentDuration === 0
          ? "loadstart"
          : currentDuration === totalDuration
            ? "loadend"
            : "loading",
      current: currentDuration,
      total: totalDuration
    }
  });
}, 1000);

const autoplay = () => {
  loadstart(cacheFiles);
  play();
};

const processLines = (lines: string[]) => {
  for (const line of lines) {
    if (isJump) return;
    if (!line.trim()) continue;
    const [timeStr, base64] = line.split(":");
    let jsonData = "";
    try {
      jsonData = atob(base64);
    } catch (error) {
      continue;
    }
    const currentTime = +timeStr / 1000;
    const action = {
      delay: currentTime - baselineTime,
      doAction() {
        if (isJump) return;
        try {
          let data;
          if (jsonData[0] === "{") {
            data = jsonData;
          } else {
            const uint8buffer = new Uint8Array(jsonData.length);
            for (let i = 0; i < jsonData.length; i++) {
              uint8buffer[i] = jsonData.charCodeAt(i);
            }
            data = uint8buffer.buffer;
          }
          data = formatMsg(data);
          if (data) {
            postMsg([
              {
                type: "data",
                data
              },
              {
                type: "timeupdate",
                data: {
                  currentDuration: currentTime - startTime
                }
              }
            ]);
          }
        } catch (error) {
          // console.log(error);
        }
      }
    };
    timer.addAction(action);
  }
  postProgress(timer.lastDelay);
};

const loadstart = async (files: File[]) => {
  for (const file of files) {
    if (isJump) return;
    const text = await readFileAsText(file);
    const lines = text.split("\n");
    processLines(lines);
  }
};

const play = (currentDuration = 0) => {
  if (timer.isActive) return;
  timer.start(currentDuration);
  postMsg({ type: "playstatechange", data: "play" });
};

const pause = () => {
  timer.stop();
  postMsg({ type: "playstatechange", data: "pause" });
};

const timeupdate = async (currentDuration: number) => {
  isJump = true;
  timer.clear();
  postMsg({ type: "playstatechange", data: "pause" });
  let maybeFileIndex = Math.floor(
    (currentDuration / totalDuration) * (cacheFiles.length - 1)
  );
  let maybeRowIndex = -1;
  while (maybeRowIndex === -1) {
    const file = cacheFiles[maybeFileIndex];
    const { firstRow, lastRow } = await readFileBothRowByFile(file);
    const fileStartDuration = +firstRow.split(":")[0] / 1000 - startTime;
    const fileEndDuration = +lastRow.split(":")[0] / 1000 - startTime;
    if (currentDuration < fileStartDuration) {
      maybeFileIndex--;
    } else if (currentDuration >= fileEndDuration) {
      maybeFileIndex++;
    } else {
      const text = await readFileAsText(file);
      const lines = text.split("\n");
      maybeRowIndex = binarySearch(lines, (line) => {
        const time = +line.split(":")[0];
        const lineDuration = time / 1000 - startTime;
        return lineDuration - currentDuration;
      });
      break;
    }
  }
  isJump = false;
  const startFile = cacheFiles[maybeFileIndex];
  const text = await readFileAsText(startFile);
  const lines = text.split("\n").slice(maybeRowIndex);
  baselineTime = +lines[0].split(":")[0] / 1000;
  timer.start();
  postMsg({ type: "playstatechange", data: "play" });
  processLines(lines);
  loadstart(cacheFiles.slice(maybeFileIndex + 1));
};

const postMsg = (msg: MaybeArray<LocalWorker.PostMessage>) => {
  if (Array.isArray(msg)) {
    msg.forEach(postMsg);
  } else {
    postMessage(msg);
  }
};

onmessage = async (ev: MessageEvent<LocalWorker.OnMessage>) => {
  const { type, data } = ev.data;
  if (type === "files") {
    cacheFiles = data;
    await getDuration();
    postMsg({
      type: "durationchange",
      data: {
        startTime,
        endTime
      }
    });
    autoplay();
  } else if (type === "playstate") {
    if (data.state === "play") {
      play(data?.currentDuration);
    } else {
      pause();
    }
  } else if (type === "timeupdate") {
    timeupdate(data.currentDuration);
  } else if (type === "rate") {
    timer.setSpeed(data);
  }
};
