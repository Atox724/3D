import type { Scene } from "three";

import { AUGMENTED_RENDER_MAP, AUGMENTED_RENDER_ORDER } from "@/constants";
import { TrafficLight, type TrafficLightUpdateData } from "@/renderer/public";
import { VIEW_WS } from "@/utils/websocket";

import Render from "../render";

const topic = AUGMENTED_RENDER_MAP.trafficLightModel;
type TopicType = (typeof topic)[number];

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
  topic: readonly TopicType[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene, renderOrder = AUGMENTED_RENDER_ORDER.TRAFFICLIGHT) {
    super();

    const createTrafficLight = () => new TrafficLight(scene, renderOrder);

    this.createRender = {
      localmap_other_traffic_light: createTrafficLight(),
      localmap_traffic_light: createTrafficLight()
    };

    let topic: TopicType;
    for (topic in this.createRender) {
      VIEW_WS.on(topic, (data: TrafficLightUpdateDataMap[TopicType]) => {
        this.createRender[data.topic].update(data.data);
      });
    }
  }

  dispose(): void {
    for (const topic in this.createRender) {
      VIEW_WS.off(topic);
    }
    super.dispose();
  }
}
