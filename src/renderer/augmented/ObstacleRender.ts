import type { Scene } from "three";

import { AUGMENTED_RENDER_MAP, AUGMENTED_RENDER_ORDER } from "@/constants";
import { Obstacle, type ObstacleUpdateData } from "@/renderer/public";
import { VIEW_WS } from "@/utils/websocket";

import Render from "../render";

const topic = AUGMENTED_RENDER_MAP.obstacleModel;
type TopicType = (typeof topic)[number];

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
  topic: readonly TopicType[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene, renderOrder = AUGMENTED_RENDER_ORDER.OBSTACLE) {
    super();

    const createObstacle = () => new Obstacle(scene, renderOrder);

    this.createRender = {
      "pilothmi_perception_obstacle_fusion object": createObstacle(),
      pilothmi_perception_obstacle_local: createObstacle()
    };

    let topic: TopicType;
    for (topic in this.createRender) {
      VIEW_WS.on(topic, (data: ObstacleUpdateDataMap[TopicType]) => {
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
