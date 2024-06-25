import type { Scene } from "three";

import type { VIRTUAL_RENDER_MAP } from "@/constants/topic";
import { VIEW_WS } from "@/utils/websocket";

import { Text, type TextUpdateData } from "../common";

type TEXT_SPRITE_TOPIC_TYPE = (typeof VIRTUAL_RENDER_MAP.text_sprite)[number];

export default class TextRender extends Text {
  topic: TEXT_SPRITE_TOPIC_TYPE;
  constructor(scene: Scene, topic: TEXT_SPRITE_TOPIC_TYPE) {
    super(scene);
    this.topic = topic;

    VIEW_WS.on(
      topic,
      (data: { data: TextUpdateData; topic: TEXT_SPRITE_TOPIC_TYPE }) => {
        this.update(data.data);
      }
    );
  }
}
