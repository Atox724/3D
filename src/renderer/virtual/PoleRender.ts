import type { Scene } from "three";

import type { VIRTUAL_RENDER_MAP } from "@/constants/topic";
import { Pole, type PoleUpdateData } from "@/renderer/common";
import { VIEW_WS } from "@/utils/websocket";

type POLE_MODEL_TOPIC_TYPE = (typeof VIRTUAL_RENDER_MAP.poleModel)[number];

export default class PoleRender extends Pole {
  topic: POLE_MODEL_TOPIC_TYPE;

  constructor(scene: Scene, topic: POLE_MODEL_TOPIC_TYPE) {
    super(scene);
    this.topic = topic;

    VIEW_WS.on(
      topic,
      (data: { data: PoleUpdateData; topic: POLE_MODEL_TOPIC_TYPE }) => {
        this.update(data.data);
      }
    );
  }
}
