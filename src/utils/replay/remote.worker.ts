import { binarySearch, formatMsg } from "..";
import { readFileAsText, readFileBothRowByFile } from "../file";
import { Timer } from "./timer";
import type { MaybeArray, RemoteWorker, RequestWorker } from "./type";

const timer = new Timer();

let cacheFiles: File[] = [];

let startTime = 0,
  endTime = 0,
  baselineTime = 0;

let needStop = false;

const requestWorker = new Worker(
  new URL("./request.worker.ts", import.meta.url),
  { type: "module" }
);

requestWorker.onmessage = (ev: MessageEvent<RequestWorker.PostMessage>) => {
  const { type, data } = ev.data;
  if (type === "durationchange") {
    startTime = data.startTime;
    endTime = data.endTime;
    baselineTime = startTime;
    postMsg({ type, data });
  } else if (type === "files") {
    cacheFiles.push(...data);
    cacheFiles.sort((a, b) => a.name.localeCompare(b.name));
    loadstart(data);
    play();
  }
};

const postMsg = (msg: MaybeArray<RemoteWorker.PostMessage>) => {
  if (Array.isArray(msg)) {
    msg.forEach(postMsg);
  } else {
    postMessage(msg);
  }
};

const processLines = (lines: string[]) => {
  for (const line of lines) {
    if (needStop) return;
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
        if (needStop) return;
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
};

const loadstart = async (files: File[]) => {
  for (const file of files) {
    if (needStop) return;
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
  needStop = true;
  timer.clear();
  postMsg({ type: "playstatechange", data: "pause" });
  const totalDuration = endTime - startTime;
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
  needStop = false;
  const startFile = cacheFiles[maybeFileIndex];
  const text = await readFileAsText(startFile);
  const lines = text.split("\n").slice(maybeRowIndex);
  baselineTime = +lines[0].split(":")[0] / 1000;
  timer.start();
  postMsg({ type: "playstatechange", data: "play" });
  processLines(lines);
  loadstart(cacheFiles.slice(maybeFileIndex + 1));
};

onmessage = async (ev: MessageEvent<RemoteWorker.OnMessage>) => {
  const { type, data } = ev.data;
  if (type === "request") {
    cacheFiles = [];
    requestWorker.postMessage({ type, data });
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
