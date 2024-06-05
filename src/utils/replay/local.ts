import emitter from "../emitter";
import { VIEW_WS } from "../websocket";
import type { LocalWorker } from "./type";
import { BasicPlay } from "./utils";

export class LocalPlay extends BasicPlay {
  worker: Worker;

  constructor() {
    super();
    this.worker = new Worker(new URL("./local.worker.ts", import.meta.url), {
      type: "module"
    });
    this.worker.onmessage = this.onMessage;
  }

  init(files: FileList) {
    this.postMessage({
      type: "file",
      data: files
    });
  }

  postMessage(msg: LocalWorker.OnMessage.Type) {
    this.worker.postMessage(msg);
  }

  onMessage = (ev: MessageEvent<LocalWorker.PostMessage.Type>) => {
    const { type, data } = ev.data;
    switch (type) {
      case "time":
        this.startTime = data.startTime;
        this.endTime = data.endTime;
        emitter.emit("durationchange", this.duration);
        break;
      case "playState":
        emitter.emit("playState", data.state);
        break;
      case "data":
        VIEW_WS.dispatchTargetMsg(data.topic, data.data);
        break;
      case "timeupdate":
        emitter.emit("timeupdate", data.currentDuration);
        break;
    }
  };

  dispose() {
    this.worker.terminate();
  }
}
