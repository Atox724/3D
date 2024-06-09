import EventEmitter from "eventemitter3";

import { VIEW_WS } from "../websocket";
import type { Local } from "./type";

type Events = {
  [E in Local.OnMessage as E["type"]]: (data: E["data"]) => void;
};

export class LocalPlay extends EventEmitter<Events> {
  worker: Worker;

  startTime = 0;
  endTime = 0;

  get duration() {
    if (!this.startTime || !this.endTime) return Number.NaN;
    return this.endTime - this.startTime;
  }

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
    this.emit(type, data);
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
    this.removeAllListeners();
  }
}
