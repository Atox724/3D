import { VIEW_WS } from "../websocket";
import emitter from "./emitter";
import type { Remote } from "./type";
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

  init(url: string, params?: Record<string, any>) {
    this.postMessage({
      type: "request",
      data: {
        url,
        params
      }
    });
  }

  postMessage(msg: Remote.PostMessage) {
    this.worker.postMessage(msg);
  }

  onMessage = (ev: MessageEvent<Remote.OnMessage>) => {
    const { type, data } = ev.data;
    emitter.emit(type, data);
    switch (type) {
      case "durationchange":
        this.startTime = data.startTime;
        this.endTime = data.endTime;
        break;
      case "data":
        VIEW_WS.dispatchTargetMsg(data.topic, data.data);
        break;
    }
  };

  dispose() {
    this.worker.terminate();
  }
}
