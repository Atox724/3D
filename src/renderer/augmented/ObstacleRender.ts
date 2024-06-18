import type { Scene } from "three";

import { AUGMENTED_RENDER_MAP } from "@/constants";
import { Obstacle, type ObstacleUpdateData } from "@/renderer/public";
import type { ALLRenderType } from "@/typings";
import { VIEW_WS } from "@/utils/websocket";

import Render from "../render";

const topics = AUGMENTED_RENDER_MAP.obstacleModel;
type TopicType = (typeof topics)[number];

type ObstacleUpdateDataMap = {
  [key in TopicType]: {
    topic: TopicType;
    data: ObstacleUpdateData;
  };
};

type CreateRenderMap = {
  [key in TopicType]: Obstacle;
};

export default class ObstacleRender extends Render {
  type: ALLRenderType = "obstacleModel";

  createRender = {} as CreateRenderMap;

  constructor(scene: Scene) {
    super();

    topics.forEach((topic) => {
      this.createRender[topic] = new Obstacle(scene);
      VIEW_WS.on(topic, (data: ObstacleUpdateDataMap[TopicType]) => {
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
