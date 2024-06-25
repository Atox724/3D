import type { Scene } from "three";

import type { AUGMENTED_RENDER_MAP } from "@/constants/topic";
import { Obstacle, type ObstacleUpdateData } from "@/renderer/public";
import { VIEW_WS } from "@/utils/websocket";

type OBSTACLE_MODEL_TOPIC_TYPE =
  (typeof AUGMENTED_RENDER_MAP.obstacleModel)[number];

export default class ObstacleRender extends Obstacle {
  topic: OBSTACLE_MODEL_TOPIC_TYPE;

  constructor(scene: Scene, topic: OBSTACLE_MODEL_TOPIC_TYPE) {
    super(scene);
    this.topic = topic;

    VIEW_WS.on(
      topic,
      (data: {
        data: ObstacleUpdateData;
        topic: OBSTACLE_MODEL_TOPIC_TYPE;
      }) => {
        this.update(data.data);
      }
    );
  }
}
