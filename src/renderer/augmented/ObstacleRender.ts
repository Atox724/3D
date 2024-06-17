import type { Scene } from "three";

import { AUGMENTED_RENDER_MAP, AUGMENTED_RENDER_ORDER } from "@/constants";
import { Obstacle, type ObstacleUpdateData } from "@/renderer/public";

import Target from "../target";

const topic = AUGMENTED_RENDER_MAP.obstacleModel;
type TopicType = (typeof topic)[number];

type ObstacleUpdateDataMap = {
  [key in TopicType]: ObstacleUpdateData;
};

type CreateRenderMap = {
  [key in TopicType]: Obstacle;
};

export default class ObstacleRender extends Target {
  topic: readonly TopicType[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene, renderOrder = AUGMENTED_RENDER_ORDER.OBSTACLE) {
    super(scene, renderOrder);

    const createObstacle = () => new Obstacle(scene, renderOrder);

    this.createRender = {
      "pilothmi_perception_obstacle_fusion object": createObstacle(),
      pilothmi_perception_obstacle_local: createObstacle()
    };
  }

  update<T extends TopicType>(data: ObstacleUpdateDataMap[T], topic: T) {
    this.createRender[topic].update(data);
  }
}
