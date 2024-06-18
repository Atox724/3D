import type { Scene } from "three";

import { AUGMENTED_RENDER_MAP } from "@/constants";
import { Line, type LineUpdateData } from "@/renderer/public";
import { VIEW_WS } from "@/utils/websocket";

import Render from "../render";

const topics = AUGMENTED_RENDER_MAP.polyline;
type TopicType = (typeof topics)[number];

type PolylineUpdateDataMap = {
  [key in TopicType]: {
    topic: TopicType;
    data: LineUpdateData;
  };
};

type CreateRenderMap = {
  [key in TopicType]: Line;
};

export default class PolylineRender extends Render {
  createRender = {} as CreateRenderMap;

  constructor(scene: Scene) {
    super();

    topics.forEach((topic) => {
      this.createRender[topic] = new Line(scene);
      VIEW_WS.on(topic, (data: PolylineUpdateDataMap[typeof topic]) => {
        this.createRender[data.topic].update(data.data);
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
