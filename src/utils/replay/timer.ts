import { throttle } from "lodash-es";

import { binarySearch } from "@/utils";

import type { Action } from "./type";

export class Timer {
  timeOffset = 0;
  speed = 1;

  private actions: Action[] = [];
  private raf: number | true | null = null;
  private lastTimestamp = 0;

  /** 是否有任务 */
  get actionsLength() {
    return this.actions.length;
  }

  /** 是否正在运行 */
  get isActive() {
    return this.raf !== null;
  }

  /** 最后一帧的延时 */
  get lastDelay() {
    return this.actions[this.actions.length - 1].delay;
  }

  addAction = throttle((action: Action) => {
    if (!this.actionsLength || this.lastDelay < action.delay) {
      this.actions.push(action);
    } else {
      const index = binarySearch(
        this.actions,
        (item) => item.delay - action.delay
      );
      this.actions.splice(index, 0, action);
    }
    if (this.raf === true) {
      this.raf = requestAnimationFrame(this.rafCheck.bind(this));
    }
  }, 1000 / 60);

  start(timeOffset = 0) {
    this.timeOffset = timeOffset;
    this.lastTimestamp = performance.now();
    this.raf = requestAnimationFrame(this.rafCheck.bind(this));
  }

  stop() {
    if (this.raf) {
      if (this.raf !== true) {
        cancelAnimationFrame(this.raf);
      }
      this.raf = null;
    }
  }

  private rafCheck() {
    const time = performance.now();
    // FIX: 最大延迟为 1 帧, 避免一直卡在 while 中
    const diff = Math.min(time - this.lastTimestamp, 1000 / 60);
    this.timeOffset += diff * this.speed;
    this.lastTimestamp = time;
    while (this.actionsLength) {
      const action = this.actions[0];
      if (this.timeOffset >= action.delay) {
        this.actions.shift();
        action.doAction();
        if (performance.now() - time > 1000 / 60) {
          // 如果超过16ms，则停止处理，避免阻塞
          break;
        }
      } else {
        break;
      }
    }
    if (this.actionsLength) {
      this.raf = requestAnimationFrame(this.rafCheck.bind(this));
    } else {
      this.raf = true;
    }
  }

  clear() {
    this.stop();
    this.actions.length = 0;
  }

  setSpeed(speed: number) {
    this.speed = speed;
  }
}
