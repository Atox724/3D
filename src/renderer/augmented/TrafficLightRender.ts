import type { Scene } from "three";

import { AUGMENTED_RENDER_MAP, AUGMENTED_RENDER_ORDER } from "@/constants";
import { TrafficLight, type TrafficLightUpdateData } from "@/renderer/public";

import Target from "../target";

const topic = AUGMENTED_RENDER_MAP.trafficLightModel;
type TopicType = (typeof topic)[number];

type TrafficLightUpdateDataMap = {
  [key in TopicType]: TrafficLightUpdateData;
};

type CreateRenderMap = {
  [key in TopicType]: TrafficLight;
};

export default class TrafficLightRender extends Target {
  topic: readonly TopicType[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene, renderOrder = AUGMENTED_RENDER_ORDER.TRAFFICLIGHT) {
    super(scene, renderOrder);

    const createTrafficLight = () => new TrafficLight(scene, renderOrder);

    this.createRender = {
      localmap_other_traffic_light: createTrafficLight(),
      localmap_traffic_light: createTrafficLight()
    };
  }

  update<T extends TopicType>(data: TrafficLightUpdateDataMap[T], topic: T) {
    this.createRender[topic].update(data);
  }
}
