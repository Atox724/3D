import type { Scene } from "three";

import type { VIRTUAL_RENDER_MAP } from "@/constants/topic";
import { VIEW_WS } from "@/utils/websocket";

import { Polygon, type PolygonUpdateData } from "../public";

type POLYGON_TOPIC_TYPE = (typeof VIRTUAL_RENDER_MAP.polygon)[number];

export default class PolygonRender extends Polygon {
  topic: POLYGON_TOPIC_TYPE;
  constructor(scene: Scene, topic: POLYGON_TOPIC_TYPE) {
    super(scene);
    this.topic = topic;

    VIEW_WS.on(
      topic,
      (data: {
        data: { polygon_array: PolygonUpdateData };
        topic: POLYGON_TOPIC_TYPE;
      }) => {
        this.update(data.data.polygon_array);
      }
    );
  }
}
