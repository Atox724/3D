import type { Scene } from "three";

import { AUGMENTED_RENDER_MAP } from "@/constants";
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

  constructor(scene: Scene) {
    super(scene);

    this.createRender = {
      "pilothmi_perception_obstacle_fusion object": new Obstacle(scene),
      pilothmi_perception_obstacle_local: new Obstacle(scene)
    };
  }

  update<T extends TopicType>(data: ObstacleUpdateDataMap[T], topic: T) {
    this.createRender[topic].update(data);
  }
}
