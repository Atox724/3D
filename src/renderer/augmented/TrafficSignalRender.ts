import type { Scene } from "three";

import { AUGMENTED_RENDER_MAP, AUGMENTED_RENDER_ORDER } from "@/constants";
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

  constructor(
    scene: Scene,
    renderOrder = AUGMENTED_RENDER_ORDER.TRAFFICSIGNAL
  ) {
    super(scene, renderOrder);

    const createTrafficSignal = () => new TrafficSignal(scene, renderOrder);

    this.createRender = {
      localmap_other_traffic_sign: createTrafficSignal(),
      localmap_traffic_sign: createTrafficSignal()
    };
  }

  update<T extends TopicType>(data: TrafficSignalUpdateDataMap[T], topic: T) {
    this.createRender[topic].update(data);
  }
}
