import { VIEW_WS } from "../websocket";
import emitter from "./emitter";
import type { Local } from "./type";
import { BasicPlay } from "./utils";

export class LocalPlay extends BasicPlay {
  worker: Worker;

  constructor() {
    super();
    this.worker = new Worker(new URL("./new.worker.ts", import.meta.url), {
      type: "module"
    });
    this.worker.onmessage = this.onMessage;
  }

  init(files: File[]) {
    this.postMessage({
      type: "files",
      data: files
    });
  }

  postMessage(msg: Local.PostMessage) {
    this.worker.postMessage(msg);
  }

  onMessage = (ev: MessageEvent<Local.OnMessage>) => {
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
