interface HMIFileType {
  modifyTime: string;
  name: string;
  path: string;
  preSigned: string;
  size: string;
  type: string;
  urlHMI: string;
}

interface QueueType {
  requestFunc: () => any;
  index: number;
}

// 自定义的请求队列类
class RequestQueue {
  maxConcurrency: number;
  callback: (...args: any[]) => void;
  queue: QueueType[];
  activeCount: number;
  cancelTokens: never[];
  constructor(maxConcurrency = 3, callback: (...args: any[]) => void) {
    this.maxConcurrency = maxConcurrency;
    this.callback = callback;
    this.queue = [];
    this.activeCount = 0;
    this.cancelTokens = [];
  }

  async add(requestFunc: QueueType["requestFunc"], index: QueueType["index"]) {
    this.queue.push({ requestFunc, index });
    this.processQueue();
  }

  async processQueue() {
    if (this.activeCount >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    const { requestFunc, index } = this.queue[0];
    this.queue.shift();
    this.activeCount++;

    try {
      const result = await requestFunc();
      this.callback(result, index);
    } catch (error) {
      console.error(`Error processing request ${index}:`, error);
    } finally {
      this.activeCount--;
      this.processQueue();
    }
  }
}

onmessage = async (ev) => {
  const { url, params } = ev.data;
  const urlStr = new URL(url);
  for (const key in params) {
    urlStr.searchParams.append(key, params[key]);
  }
  const res = await fetch(urlStr.toString()).then((response) =>
    response.json()
  );
  const hmi_files = res.data as HMIFileType[];
  const callback = (result: string, index: number) => {
    postMessage({
      type: "data",
      data: {
        result,
        index
      }
    });
  };

  const requestQueue = new RequestQueue(1, callback); // 最大并发数为3
  const firstFile = hmi_files.shift()!;
  const lastFile = hmi_files.pop()!;
  const requestFirstFunc = async () => {
    const response = await fetch(firstFile.preSigned).then((response) =>
      response.text()
    );
    return response;
  };
  const requestLastFunc = async () => {
    const response = await fetch(lastFile.preSigned).then((response) =>
      response.text()
    );
    return response;
  };
  const [firstResult, lastResult] = await Promise.all([
    requestFirstFunc(),
    requestLastFunc()
  ]);
  // 找到第一个非空行的索引
  let firstRowIndex = firstResult.indexOf("\n");
  while (firstRowIndex !== -1 && firstResult[firstRowIndex + 1] === "\n") {
    firstRowIndex = firstResult.indexOf("\n", firstRowIndex + 2);
  }
  if (firstRowIndex === -1) {
    // 如果所有行都是空行，则设定为 0
    firstRowIndex = 0;
  }
  const firstRow = firstResult.slice(0, firstRowIndex);
  const startTime = +firstRow.split(":")[0];

  // 找到最后一个非空行的索引
  let lastRowIndex = lastResult.lastIndexOf("\n");
  while (lastRowIndex !== -1 && !lastResult[lastRowIndex + 1]) {
    lastRowIndex = lastResult.lastIndexOf("\n", lastRowIndex - 2);
  }
  if (lastRowIndex === -1) {
    // 如果所有行都是空行，则设定为最后一个字符索引
    lastRowIndex = lastResult.length - 1;
  }
  const lastRow = lastResult.slice(lastRowIndex + 1);
  const endTime = +lastRow.split(":")[0];

  postMessage({
    type: "time",
    data: {
      startTime,
      endTime
    }
  });

  hmi_files.forEach((file, index) => {
    const requestFunc = async () => {
      const response = await fetch(file.preSigned).then((response) =>
        response.text()
      );
      return response;
    };
    requestQueue.add(requestFunc, index);
  });
};
