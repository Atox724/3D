import EventEmitter from "eventemitter3";

import type { EventType } from "./type";

// 将联合类型映射到 MyEvents
type MyEvents = {
  [E in EventType.ALL as E["type"]]: (data: E["data"]) => void;
};
const emitter = new EventEmitter<MyEvents>();

export default emitter;
