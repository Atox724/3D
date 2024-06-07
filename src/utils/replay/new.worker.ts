import { formatMsg } from "..";
import {
  readFileAsText,
  readFileFirstRowByFile,
  readFileLastRowByFile
} from "../file";
import type { LocalWorker, MaybeArray } from "./type";

const DUMP_MS = 1000 / 60;

const cacheData = new Map<number, string[]>();
let playIndex = 0;

let startTime = 0,
  endTime = 0,
  baselineTime = 0;

const getDuration = async (firstFile: File, lastFile: File) => {
  const startRow = await readFileFirstRowByFile(firstFile);
  const endRow = await readFileLastRowByFile(lastFile);
  const startColonIndex = startRow.indexOf(":");
  const endColonIndex = endRow.indexOf(":");
  if (startColonIndex === -1 || endColonIndex === -1) return;

  startTime = +startRow.slice(0, startColonIndex) / 1000;
  endTime = +endRow.slice(0, endColonIndex) / 1000;
  baselineTime = startTime;
};

const postMsg = (msg: MaybeArray<LocalWorker.PostMessage>) => {
  if (Array.isArray(msg)) {
    msg.forEach(postMsg);
  } else {
    postMessage(msg);
  }
};

const processLines = (lines: string[]) => {
  lines.forEach((line) => {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) return;
    const framestamp = Math.floor(
      parseInt(line.slice(0, colonIndex)) / DUMP_MS / 1000
    );
    const cacheLines = cacheData.get(framestamp);
    if (!cacheLines) {
      cacheData.set(framestamp, [line.slice(colonIndex + 1)]);
    } else {
      cacheLines.push(line.slice(colonIndex + 1));
    }
    postMsg({
      type: "loadstate",
      data: {
        state: "loading",
        current: framestamp * DUMP_MS,
        total: endTime
      }
    });
  });
};

const loadstart = async (files: File[]) => {
  for (const file of files) {
    const text = await readFileAsText(file);
    const lines = text.split("\n");
    processLines(lines);
  }
};

const play = (currentDuration = 0) => {
  // if (timer.isActive) return;
  // timer.start(currentDuration);
  postMsg({ type: "playstatechange", data: "play" });
  setInterval(() => {
    const datas = [...cacheData.entries()];
    if (playIndex >= datas.length) {
      return;
    }
    const [currentTime, lines] = datas[playIndex];
    lines.forEach((line) => {
      const jsonData = atob(line);
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
                currentDuration: currentTime * DUMP_MS - startTime
              }
            }
          ]);
        }
      } catch (error) {
        // console.log(error);
      }
    });
    playIndex++;
  }, DUMP_MS);
};

const autoplay = (files: File[]) => {
  loadstart(files);
  play();
};

onmessage = async (ev: MessageEvent<LocalWorker.OnMessage>) => {
  const { type, data } = ev.data;
  if (type === "files") {
    await getDuration(data[0], data[data.length - 1]);
    postMsg({
      type: "durationchange",
      data: {
        startTime,
        endTime
      }
    });
    autoplay(data);
  }
};
