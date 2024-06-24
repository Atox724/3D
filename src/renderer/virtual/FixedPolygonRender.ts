import type { Scene } from "three";

import { VIRTUAL_RENDER_MAP } from "@/constants";
import type { ALLRenderType } from "@/typings";
import { VIEW_WS } from "@/utils/websocket";

import { FixedPolygon, type FixedPolygonUpdateData } from "../public";
import Render from "../render";

const topics = VIRTUAL_RENDER_MAP.fixedPolygon;
type TopicType = (typeof topics)[number];

type FixedPolygonUpdateDataMap = {
  [key in TopicType]: {
    topic: TopicType;
    data: FixedPolygonUpdateData;
  };
};

type CreateRenderMap = {
  [key in TopicType]: FixedPolygon;
};

export default class FixedPolygonRender extends Render {
  type: ALLRenderType = "fixedPolygon";

  createRender = {} as CreateRenderMap;

  constructor(scene: Scene) {
    super();

    topics.forEach((topic) => {
      this.createRender[topic] = new FixedPolygon(scene);
      VIEW_WS.on(topic, (data: FixedPolygonUpdateDataMap[typeof topic]) => {
        this.createRender[data.topic].update(data.data);
      });
    });
  }

  dispose(): void {
    let topic: TopicType;
    for (topic in this.createRender) {
      VIEW_WS.off(topic);
    }
    super.dispose();
  }
}
