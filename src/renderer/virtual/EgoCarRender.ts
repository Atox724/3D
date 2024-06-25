import type { Scene } from "three";

import type { VIRTUAL_RENDER_MAP } from "@/constants/topic";
import { VIEW_WS } from "@/utils/websocket";

import { EgoCar, type EgoCarUpdateData } from "../common";

type CAR_POSE_TOPIC_TYPE = (typeof VIRTUAL_RENDER_MAP.car_pose)[number];

export default class EgoCarRender extends EgoCar {
  topic: CAR_POSE_TOPIC_TYPE;

  constructor(scene: Scene, topic: CAR_POSE_TOPIC_TYPE) {
    super(scene);
    this.topic = topic;

    VIEW_WS.on(
      topic,
      (data: { data: EgoCarUpdateData; topic: CAR_POSE_TOPIC_TYPE }) => {
        this.update(data.data);
      }
    );
  }
}
