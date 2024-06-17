import type { Scene } from "three";

import { AUGMENTED_RENDER_MAP, AUGMENTED_RENDER_ORDER } from "@/constants";
import { TrafficSignal, type TrafficSignalUpdateData } from "@/renderer/public";
import { VIEW_WS } from "@/utils/websocket";

import Render from "../render";

const topic = AUGMENTED_RENDER_MAP.trafficSignalModel;
type TopicType = (typeof topic)[number];

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
  topic: readonly TopicType[] = topic;

  createRender: CreateRenderMap;

  constructor(
    scene: Scene,
    renderOrder = AUGMENTED_RENDER_ORDER.TRAFFICSIGNAL
  ) {
    super();

    const createTrafficSignal = () => new TrafficSignal(scene, renderOrder);

    this.createRender = {
      localmap_other_traffic_sign: createTrafficSignal(),
      localmap_traffic_sign: createTrafficSignal()
    };

    let topic: TopicType;
    for (topic in this.createRender) {
      VIEW_WS.on(topic, (data: TrafficSignalUpdateDataMap[TopicType]) => {
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
