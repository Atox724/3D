import type { Scene } from "three";

import { AUGMENTED_RENDER_MAP } from "@/constants";
import { TrafficSignal, type TrafficSignalUpdateData } from "@/renderer/public";

import Target from "../target";

const topic = AUGMENTED_RENDER_MAP.trafficSignalModel;
type TopicType = (typeof topic)[number];

type TrafficSignalUpdateDataMap = {
  [key in TopicType]: TrafficSignalUpdateData;
};

type CreateRenderMap = {
  [key in TopicType]: TrafficSignal;
};

export default class TrafficSignalRender extends Target {
  topic: readonly TopicType[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene) {
    super(scene);

    this.createRender = {
      localmap_other_traffic_sign: new TrafficSignal(scene),
      localmap_traffic_sign: new TrafficSignal(scene)
    };
  }

  update<T extends TopicType>(data: TrafficSignalUpdateDataMap[T], topic: T) {
    this.createRender[topic].update(data);
  }
}
