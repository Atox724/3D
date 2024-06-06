import pLimit from "p-limit";

import { readFileFirstRowByFile, readFileLastRowByFile } from "../file";
import type { MaybeArray, RequestWorker } from "./type";

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

const requestHMIFile = async (hmi_file: HMIFileType) => {
  const res = await fetch(hmi_file.preSigned).then((response) =>
    response.blob()
  );
  const file = new File([res], hmi_file.name, {
    type: hmi_file.type
  });
  return file;
};

const getDuration = async (firstFile: File, lastFile: File) => {
  const startRow = await readFileFirstRowByFile(firstFile);
  const endRow = await readFileLastRowByFile(lastFile);

  const startTime = +startRow.split(":")[0] / 1000;
  const endTime = +endRow.split(":")[0] / 1000;
  return { startTime, endTime };
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
    const urlStr = new URL(data.url, location.origin);
    for (const key in data.params) {
      urlStr.searchParams.append(key, data.params[key]);
    }
    const res = await fetch(urlStr.toString()).then<HMIResponseType>(
      (response) => response.json()
    );
    const hmi_files = res.data;
    const filesLength = hmi_files.length;
    const firstFile = hmi_files.shift()!;
    const lastFile = hmi_files.pop()!;

    const [firstResult, lastResult] = await Promise.all([
      requestHMIFile(firstFile),
      requestHMIFile(lastFile)
    ]);

    const { startTime, endTime } = await getDuration(firstResult, lastResult);

    postMsg([
      {
        type: "durationchange",
        data: {
          startTime,
          endTime
        }
      },
      {
        type: "file",
        data: {
          file: firstResult,
          current: 0,
          total: filesLength - 1
        }
      },
      {
        type: "file",
        data: {
          file: lastResult,
          current: filesLength - 1,
          total: filesLength - 1
        }
      }
    ]);

    const limit = pLimit(6);

    const input: Promise<void>[] = [];

    for (const hmi_file of hmi_files) {
      const p = limit(() =>
        requestHMIFile(hmi_file).then((res) => {
          postMsg({
            type: "file",
            data: {
              file: res,
              current: hmi_files.indexOf(hmi_file) + 1,
              total: filesLength - 1
            }
          });
        })
      );
      input.push(p);
    }
    await Promise.all(input);
  }
};
