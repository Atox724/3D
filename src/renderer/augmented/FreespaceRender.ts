import type { Scene } from "three";

import type { AUGMENTED_RENDER_MAP } from "@/constants/topic";
import { Freespace, type FreespaceUpdateData } from "@/renderer/common";
import { VIEW_WS } from "@/utils/websocket";

type FREESPACE_TOPIC_TYPE = (typeof AUGMENTED_RENDER_MAP.freespace)[number];

export default class FreespaceRender extends Freespace {
  topic: FREESPACE_TOPIC_TYPE;
  constructor(scene: Scene, topic: FREESPACE_TOPIC_TYPE) {
    super(scene);
    this.topic = topic;

    VIEW_WS.on(
      topic,
      (data: { data: FreespaceUpdateData; topic: FREESPACE_TOPIC_TYPE }) => {
        this.update(data.data);
      }
    );
  }
}
