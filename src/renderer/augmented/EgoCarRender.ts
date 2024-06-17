import type { Scene } from "three";

import { VIEW_WS } from "@/utils/websocket";

import { EgoCar, type EgoCarUpdateData } from "../public";
import Render from "../render";

const topic = ["car_pose"] as const;
type TopicType = (typeof topic)[number];

type EgoCarUpdateDataMap = {
  [key in TopicType]: {
    topic: TopicType;
    data: EgoCarUpdateData;
  };
};

type CreateRenderMap = {
  [key in TopicType]: EgoCar;
};

export default class EgoCarRender extends Render {
  topic: readonly TopicType[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene, renderOrder = 0) {
    super();

    this.createRender = {
      car_pose: new EgoCar(scene, renderOrder)
    };

    let topic: TopicType;
    for (topic in this.createRender) {
      VIEW_WS.on(topic, (data: EgoCarUpdateDataMap[TopicType]) => {
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
