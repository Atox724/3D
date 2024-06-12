import type { MaybeArray, PlayState, RemoteWorker, Request } from "@/typings";
import { formatMsg, transform_MS } from "@/utils";

const DUMP_MS = 1000 / 60;

const postMsg = (msg: MaybeArray<RemoteWorker.PostMessage>) => {
  if (Array.isArray(msg)) {
    msg.forEach(postMsg);
  } else {
    postMessage(msg);
  }
};

const getKeyByTime = (timestamp: number) => {
  return Math.floor(transform_MS(timestamp) / DUMP_MS);
};

class Player {
  #initialized = false;

  startTime = 0;
  endTime = 0;
  currentTime = 0;

  #speed = 1;

  #cacheData = new Map<number, string[]>();

  #playTimer = 0;

  #playState: PlayState = "pause";
  get playState() {
    return this.#playState;
  }
  set playState(state: PlayState) {
    if (state !== this.#playState) {
      this.#playState = state;
      postMsg({
        type: "playstatechange",
        data: state
      });
    }
  }

  async init(url: string, params?: Record<string, any>) {
    if (this.#initialized) return;
    this.#initialized = true;
    let requestWorker: Worker | null = new Worker(
      new URL("./request.worker.ts", import.meta.url),
      {
        type: "module"
      }
    );
    requestWorker.onmessage = (ev: MessageEvent<Request.OnMessage>) => {
      const { type, data } = ev.data;
      if (type === "durationchange") {
        this.startTime = data.startTime;
        this.endTime = data.endTime;
        postMsg({ type, data });
      } else if (type === "response") {
        const lines = data.text.split("\n");
        this.#mergeFrames(lines);
        postMsg({
          type: "loadstate",
          data: {
            state: "loading",
            current: data.current,
            total: data.total
          }
        });
      } else if (type === "finish") {
        requestWorker?.terminate();
        requestWorker = null;
      }
    };
    requestWorker.postMessage({
      type: "request",
      data: {
        url,
        params
      }
    });
    this.play();
  }

  play(timestamp = this.startTime) {
    if (!this.#initialized) return;
    this.pause();
    this.currentTime = timestamp;

    let playIndex = -1;

    this.#playTimer = setInterval(() => {
      if (playIndex === -1) {
        this.playState = "loading";
        const key = getKeyByTime(this.currentTime || this.startTime);
        playIndex = [...this.#cacheData.keys()].indexOf(key);
        return;
      }
      if (this.endTime && this.currentTime >= this.endTime) {
        this.playState = "end";
        clearInterval(this.#playTimer);
        return;
      }
      if (playIndex >= this.#cacheData.size) {
        this.playState = "loading";
        return;
      }
      this.playState = "play";
      const datas = [...this.#cacheData.entries()];
      const lines = datas[playIndex][1];
      lines.forEach((line) => {
        const colonIndex = line.indexOf(":");
        if (colonIndex === -1) return;
        const data = line.slice(colonIndex + 1);
        const jsonData = atob(data);
        try {
          let data;
          if (jsonData[0] === "{") {
            data = jsonData;
          } else {
            const uint8buffer = new Uint8Array(jsonData.length);
            for (let i = 0; i < jsonData.length; i++) {
              uint8buffer[i] = jsonData.charCodeAt(i);
            }
            data = uint8buffer.buffer;
          }
          data = formatMsg(data);
          if (data) {
            postMsg({
              type: "data",
              data
            });
          }
        } catch (error) {
          // console.log(error);
        }
      });
      const lastLine = lines[lines.length - 1];
      const colonIndex = lastLine.indexOf(":");
      const timestamp = +lastLine.slice(0, colonIndex);
      this.currentTime = transform_MS(timestamp);
      postMsg({
        type: "timeupdate",
        data: this.currentTime - this.startTime
      });
      playIndex++;
    }, DUMP_MS / this.#speed);
  }

  pause() {
    this.playState = "pause";
    clearInterval(this.#playTimer);
  }

  setSpeed(speed: number) {
    this.#speed = speed;
    if (this.playState === "play") {
      this.play(this.currentTime);
    }
  }

  async #mergeFrames(lines: string[]) {
    lines.forEach((line) => {
      const colonIndex = line.indexOf(":");
      if (colonIndex === -1) return;
      const timestamp = +line.slice(0, colonIndex);
      const key = getKeyByTime(timestamp);
      const cacheLines = this.#cacheData.get(key);
      if (!cacheLines) {
        this.#cacheData.set(key, [line]);
      } else {
        cacheLines.push(line);
      }
    });
  }
}

const player = new Player();

onmessage = async (ev: MessageEvent<RemoteWorker.OnMessage>) => {
  const { type, data } = ev.data;
  if (type === "request") {
    player.init(data.url, data.params);
  } else if (type === "playstate") {
    if (data.state === "play") {
      player.play(data.currentDuration + player.startTime);
    } else if (data.state === "pause") {
      player.pause();
    }
  } else if (type === "timeupdate") {
    player.play(data + player.startTime);
  } else if (type === "playrate") {
    player.setSpeed(data);
  }
};
