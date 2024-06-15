import type { Scene } from "three";

import { AUGMENTED_RENDER_MAP } from "@/constants";
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

  constructor(scene: Scene) {
    super(scene);

    this.createRender = {
      localmap_other_traffic_light: new TrafficLight(scene),
      localmap_traffic_light: new TrafficLight(scene)
    };
  }

  update<T extends TopicType>(data: TrafficLightUpdateDataMap[T], topic: T) {
    this.createRender[topic].update(data);
  }
}
