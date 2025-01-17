import type { Scene } from "three";

import type { VIRTUAL_RENDER_MAP } from "@/constants/topic";
import { TrafficLight, type TrafficLightUpdateData } from "@/renderer/common";
import { VIEW_WS } from "@/utils/websocket";

type TOPIC_TYPE = (typeof VIRTUAL_RENDER_MAP.trafficLightModel)[number];

export default class TrafficLightRender extends TrafficLight {
  topic: TOPIC_TYPE;

  constructor(scene: Scene, topic: TOPIC_TYPE) {
    super(scene);
    this.topic = topic;

    VIEW_WS.on(
      topic,
      (data: { data: TrafficLightUpdateData; topic: TOPIC_TYPE }) => {
        this.update(data.data);
      }
    );
  }
}
