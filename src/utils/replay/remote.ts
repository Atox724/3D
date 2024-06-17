import EventEmitter from "eventemitter3";

import type { Remote } from "@/typings";

import { VIEW_WS } from "../websocket";

type Events = {
  [E in Remote.OnMessage as E["type"]]: (data: E["data"]) => void;
};

export class RemotePlay extends EventEmitter<Events> {
  worker: Worker;

  startTime = 0;
  endTime = 0;

  get duration() {
    if (!this.startTime || !this.endTime) return Number.NaN;
    return this.endTime - this.startTime;
  }

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
    this.emit(type, data);
    switch (type) {
      case "durationchange":
        this.startTime = data.startTime;
        this.endTime = data.endTime;
        break;
      case "data":
        VIEW_WS.emit(data.topic, data);
        break;
    }
  };

  dispose() {
    this.worker.terminate();
    this.removeAllListeners();
  }
}
