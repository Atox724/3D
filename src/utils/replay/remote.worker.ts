// import pLimit from "p-limit";

import { throttle } from "lodash-es";

import { binarySearch, formatMsg } from "..";
import {
  readFileAsText,
  readFileBothRowByFile,
  readFileFirstRowByFile,
  readFileLastRowByFile
} from "../file";
import { Timer } from "./timer";
import type { MaybeArray, MessageType, RemoteWorker } from "./type";

interface HMIFileType {
  modifyTime: string;
  name: string;
  path: string;
  preSigned: string;
  size: string;
  type: string;
  urlHMI: string;
}

interface HMIResponseType {
  code: number;
  data: HMIFileType[];
  message: string;
}

const timer = new Timer();

let cacheFiles: File[] = [];
let currentIndex = 0;
let loadedTotalDuration = 0,
  actionCurrentDuration = 0;

let startTime = 0,
  endTime = 0,
  totalDuration = 0,
  baselineTime = 0;

let needStop = false;

const requestHMIFile = async (hmi_file: HMIFileType) => {
  const res = await fetch(hmi_file.preSigned).then((response) =>
    response.blob()
  );
  const file = new File([res], hmi_file.name, {
    type: hmi_file.type
  });
  return file;
};

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

const postMsg = (msg: MaybeArray<RemoteWorker.PostMessage>) => {
  if (Array.isArray(msg)) {
    msg.forEach(postMsg);
  } else {
    postMessage(msg);
  }
};

const postProgress = throttle((currentDuration) => {
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

const requestHandler = async (data: MessageType.RequestType["data"]) => {
  const urlStr = new URL(data.url, location.origin);
  for (const key in data.params) {
    urlStr.searchParams.append(key, data.params[key]);
  }
  const res = await fetch(urlStr.toString()).then<HMIResponseType>((response) =>
    response.json()
  );
  const hmi_files = [...res.data];
  const filesLength = hmi_files.length;
  const firstFile = hmi_files.shift()!;
  const lastFile = hmi_files.pop()!;

  const [firstResult, lastResult] = await Promise.all([
    requestHMIFile(firstFile),
    requestHMIFile(lastFile)
  ]);

  cacheFiles = Array(filesLength).fill(null);
  cacheFiles[0] = firstResult;
  cacheFiles[filesLength - 1] = lastResult;
  await getDuration();
  postMsg({
    type: "durationchange",
    data: {
      startTime,
      endTime
    }
  });
  // const limit = pLimit(6);

  // const input: Promise<void>[] = [];

  while (hmi_files.length) {
    const files = hmi_files.splice(0, 6);
    await Promise.all(
      files.map((hmi_file) => {
        return new Promise((resolve) => {
          requestHMIFile(hmi_file).then(async (file) => {
            cacheFiles[res.data.indexOf(hmi_file)] = file;
            await checkLoad(cacheFiles.slice(currentIndex));
            resolve(null);
          });
        });
      })
    );
  }

  // for (const hmi_file of hmi_files) {
  //   await requestHMIFile(hmi_file).then((res) => {
  //     cacheFiles[hmi_files.indexOf(hmi_file) + 1] = res;
  //     return checkLoad(cacheFiles.slice(currentIndex));
  //   });
  // }
  // await Promise.all(input);
};

const autoplay = () => {
  loadstart(cacheFiles);
  play();
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
    const currentDuration = currentTime - startTime;
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
            postMsg({
              type: "data",
              data
            });
            if (currentDuration - actionCurrentDuration >= 1000) {
              postMsg({
                type: "timeupdate",
                data: {
                  currentDuration
                }
              });
              actionCurrentDuration = currentDuration;
            } else if (currentDuration - actionCurrentDuration < 0) {
              actionCurrentDuration = currentDuration;
            }
          }
        } catch (error) {
          // console.log(error);
        }
      }
    };
    timer.addAction(action);

    loadedTotalDuration = currentDuration;
  }
};

const loadstart = async (files: File[]) => {
  for (const file of files) {
    if (needStop || !file) return;
    const text = await readFileAsText(file);
    const lines = text.split("\n");
    processLines(lines);
  }
};

const checkLoad = async (files: File[]) => {
  for (const file of files) {
    if (!file) return;
    console.log(file.name, currentIndex);

    currentIndex++;
    const text = await readFileAsText(file);
    const lines = text.split("\n");
    processLines(lines);
    postProgress(loadedTotalDuration);
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
  let maybeFileIndex = Math.floor(
    (currentDuration / totalDuration) * (cacheFiles.length - 1)
  );
  let maybeRowIndex = -1;
  while (maybeRowIndex === -1) {
    const file = cacheFiles[maybeFileIndex];
    if (!file) return;
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
    requestHandler(data);
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
