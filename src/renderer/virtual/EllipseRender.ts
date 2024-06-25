import type { Scene } from "three";

import type { VIRTUAL_RENDER_MAP } from "@/constants/topic";
import { VIEW_WS } from "@/utils/websocket";

import { Ellipse, type EllipseUpdateData } from "../public";

type ELLIPSE_TOPIC_TYPE = (typeof VIRTUAL_RENDER_MAP.ellipse)[number];

export default class EllipseRender extends Ellipse {
  topic: ELLIPSE_TOPIC_TYPE;

  constructor(scene: Scene, topic: ELLIPSE_TOPIC_TYPE) {
    super(scene);
    this.topic = topic;

    VIEW_WS.on(
      topic,
      (data: { data: EllipseUpdateData; topic: ELLIPSE_TOPIC_TYPE }) => {
        this.update(data.data);
      }
    );
  }
}
