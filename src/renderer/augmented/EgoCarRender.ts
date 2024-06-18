import type { Scene } from "three";

import type { ALLRenderType } from "@/typings";
import { VIEW_WS } from "@/utils/websocket";

import { EgoCar, type EgoCarUpdateData } from "../public";
import Render from "../render";

const topics = ["car_pose"] as const;
type TopicType = (typeof topics)[number];

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
  type: ALLRenderType = "car_pose";

  createRender = {} as CreateRenderMap;

  constructor(scene: Scene) {
    super();

    topics.forEach((topic) => {
      this.createRender[topic] = new EgoCar(scene);
      VIEW_WS.on(topic, (data: EgoCarUpdateDataMap[typeof topic]) => {
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
