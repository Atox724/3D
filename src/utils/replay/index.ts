export class Replay {
  worker: Worker;

  totalDuration = 0;

  constructor() {
    this.worker = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module"
    });
    this.worker.onmessage = this.workerMessage.bind(this);
  }

  workerMessage(msg: MessageEvent) {
    console.log(msg);
  }

  dispose() {
    this.worker.terminate();
  }
}
