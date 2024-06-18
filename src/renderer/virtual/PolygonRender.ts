import type { Scene } from "three";

import { VIRTUAL_RENDER_MAP } from "@/constants";
import { VIEW_WS } from "@/utils/websocket";

import { Polygon, type PolygonUpdateData } from "../public";
import Render from "../render";

const topics = VIRTUAL_RENDER_MAP.polygon;
type TopicType = (typeof topics)[number];

type ArrowUpdateDataMap = {
  [key in TopicType]: {
    topic: TopicType;
    data: { polygon_array: PolygonUpdateData };
  };
};

type CreateRenderMap = {
  [key in TopicType]: Polygon;
};

export default class PolygonRender extends Render {
  createRender = {} as CreateRenderMap;

  constructor(scene: Scene) {
    super();

    topics.forEach((topic) => {
      this.createRender[topic] = new Polygon(scene);
      VIEW_WS.on(topic, (data: ArrowUpdateDataMap[typeof topic]) => {
        this.createRender[data.topic].update(data.data.polygon_array);
      });
    });
  }
  dispose(): void {
    for (const topic in this.createRender) {
      VIEW_WS.off(topic);
    }
    super.dispose();
  }
}
