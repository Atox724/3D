import type { Scene } from "three";

import type { AUGMENTED_RENDER_MAP } from "@/constants/topic";
import { TrafficLight, type TrafficLightUpdateData } from "@/renderer/common";
import { VIEW_WS } from "@/utils/websocket";

type TRAFFIC_LIGHT_MODEL_TOPIC_TYPE =
  (typeof AUGMENTED_RENDER_MAP.trafficLightModel)[number];

export default class TrafficLightRender extends TrafficLight {
  topic: TRAFFIC_LIGHT_MODEL_TOPIC_TYPE;

  constructor(scene: Scene, topic: TRAFFIC_LIGHT_MODEL_TOPIC_TYPE) {
    super(scene);
    this.topic = topic;

    VIEW_WS.on(
      topic,
      (data: {
        data: TrafficLightUpdateData;
        topic: TRAFFIC_LIGHT_MODEL_TOPIC_TYPE;
      }) => {
        this.update(data.data);
      }
    );
  }
}
