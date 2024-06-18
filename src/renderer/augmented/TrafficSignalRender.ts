import type { Scene } from "three";

import { AUGMENTED_RENDER_MAP } from "@/constants";
import { TrafficSignal, type TrafficSignalUpdateData } from "@/renderer/public";
import { VIEW_WS } from "@/utils/websocket";

import Render from "../render";

const topics = AUGMENTED_RENDER_MAP.trafficSignalModel;
type TopicType = (typeof topics)[number];

type TrafficSignalUpdateDataMap = {
  [key in TopicType]: {
    topic: TopicType;
    data: TrafficSignalUpdateData;
  };
};

type CreateRenderMap = {
  [key in TopicType]: TrafficSignal;
};

export default class TrafficSignalRender extends Render {
  createRender = {} as CreateRenderMap;

  constructor(scene: Scene) {
    super();

    topics.forEach((topic) => {
      this.createRender[topic] = new TrafficSignal(scene);
      VIEW_WS.on(topic, (data: TrafficSignalUpdateDataMap[typeof topic]) => {
        this.createRender[data.topic].update(data.data);
      });
    });
  }

  dispose(): void {
    for (const topic in this.createRender) {
      VIEW_WS.off(topic);
    }
    super.dispose();
  }
}
