import EventEmitter from "eventemitter3";

export abstract class BasicPlay extends EventEmitter {
  startTime = 0;
  endTime = 0;

  get duration() {
    if (!this.startTime || !this.endTime) return Number.NaN;
    return this.endTime - this.startTime;
  }
}
