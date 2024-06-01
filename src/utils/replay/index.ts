import emitter from "../emitter";
import { VIEW_WS } from "../websocket";

export class ReplayWorker {
  worker: Worker;

  constructor() {
    this.worker = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module"
    });
    this.worker.onmessage = this.onMessage;
  }

  sendMessage(data: any) {
    this.worker.postMessage(data);
  }

  onMessage = (e: MessageEvent) => {
    const { type, data } = e.data;
    switch (type) {
      case "data":
        VIEW_WS.dispatchTargetMsg(data.topic, data.data);
        break;
    }
    emitter.emit(type, e.data);
  };

  dispose() {
    this.worker.terminate();
  }
}
