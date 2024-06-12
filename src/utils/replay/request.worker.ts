import pLimit from "p-limit";

import type { MaybeArray, RequestWorker } from "@/typings";

import { getDuration } from "./utils";

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

const limit = pLimit(10);

const requestFiles = async (url: string, params?: Record<string, any>) => {
  const urlStr = new URL(url, location.origin);
  for (const key in params) {
    urlStr.searchParams.append(key, params[key]);
  }
  const res = await fetch(urlStr.toString()).then<HMIResponseType>((response) =>
    response.json()
  );
  return res.data;
};

const requestHMIFile = async (hmi_file: HMIFileType) => {
  const res = await fetch(hmi_file.preSigned).then((response) =>
    response.text()
  );
  return res;
};

const postMsg = (msg: MaybeArray<RequestWorker.PostMessage>) => {
  if (Array.isArray(msg)) {
    msg.forEach(postMsg);
  } else {
    postMessage(msg);
  }
};

onmessage = async (ev: MessageEvent<RequestWorker.OnMessage>) => {
  const { type, data } = ev.data;
  if (type === "request") {
    const { url, params } = data;
    const hmi_files = await requestFiles(url, params);
    const totalLength = hmi_files.length;
    const firstFile = hmi_files.shift()!;
    const lastFile = hmi_files.pop()!;
    const [firstResult, lastResult] = await Promise.all([
      requestHMIFile(firstFile),
      requestHMIFile(lastFile)
    ]);
    const duration = await getDuration(firstResult, lastResult);
    if (!duration) return;
    const { startTime, endTime } = duration;

    postMsg([
      {
        type: "durationchange",
        data: {
          startTime,
          endTime
        }
      },
      {
        type: "response",
        data: {
          text: firstResult,
          current: 1,
          total: totalLength
        }
      }
    ]);
    const queue = Array(hmi_files.length).fill(null);
    let processIndex = 0;
    await Promise.all(
      hmi_files.map((file, i) =>
        limit(async () => {
          const res = await requestHMIFile(file);
          queue[i] = res;
          while (queue[processIndex]) {
            const res = queue[processIndex];
            postMsg({
              type: "response",
              data: {
                text: res,
                current: processIndex + 2,
                total: totalLength
              }
            });
            processIndex++;
          }
        })
      )
    );
    postMsg([
      {
        type: "response",
        data: {
          text: lastResult,
          current: totalLength,
          total: totalLength
        }
      },
      {
        type: "finish"
      }
    ]);
  }
};
