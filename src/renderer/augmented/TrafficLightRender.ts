import type { Scene } from "three";

import { AUGMENTED_RENDER_MAP } from "@/constants";
import { TrafficLight, type TrafficLightUpdateData } from "@/renderer/public";
import type { ALLRenderType } from "@/typings";
import { VIEW_WS } from "@/utils/websocket";

import Render from "../render";

const topics = AUGMENTED_RENDER_MAP.trafficLightModel;
type TopicType = (typeof topics)[number];

type TrafficLightUpdateDataMap = {
  [key in TopicType]: {
    topic: TopicType;
    data: TrafficLightUpdateData;
  };
};

type CreateRenderMap = {
  [key in TopicType]: TrafficLight;
};

export default class TrafficLightRender extends Render {
  type: ALLRenderType = "trafficLightModel";

  createRender = {} as CreateRenderMap;

  constructor(scene: Scene) {
    super();

    topics.forEach((topic) => {
      this.createRender[topic] = new TrafficLight(scene);
      VIEW_WS.on(topic, (data: TrafficLightUpdateDataMap[typeof topic]) => {
        this.createRender[data.topic].update(data.data);
      });
    });
  }

  dispose(): void {
    let topic: TopicType;
    for (topic in this.createRender) {
      VIEW_WS.off(topic);
    }
    super.dispose();
  }
}
