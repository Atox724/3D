import type { RemoteWorker } from "./type";
import { BasicPlay } from "./utils";

export class RemotePlay extends BasicPlay {
  worker: Worker;

  constructor() {
    super();
    this.worker = new Worker(new URL("./remote.worker.ts", import.meta.url), {
      type: "module"
    });
    this.worker.onmessage = this.onMessage;
  }

  init(text: string) {
    this.postMessage({
      type: "data",
      data: text
    });
  }

  postMessage(msg: RemoteWorker.OnMessage.Type) {
    this.worker.postMessage(msg);
  }

  onMessage = (ev: MessageEvent<RemoteWorker.PostMessage.Type>) => {
    const { type, data } = ev.data;
    switch (type) {
      case "time":
        this.startTime = data.startTime;
        this.endTime = data.endTime;
        break;
    }
  };

  dispose() {
    this.worker.terminate();
  }
}
