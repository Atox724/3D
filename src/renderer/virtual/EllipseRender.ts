import type { Scene } from "three";

import { VIRTUAL_RENDER_MAP } from "@/constants";
import type { ALLRenderType } from "@/typings";
import { VIEW_WS } from "@/utils/websocket";

import { Ellipse, type EllipseUpdateData } from "../public";
import Render from "../render";

const topics = VIRTUAL_RENDER_MAP.ellipse;
type TopicType = (typeof topics)[number];

type EllipseUpdateDataMap = {
  [key in TopicType]: {
    topic: TopicType;
    data: EllipseUpdateData;
  };
};

type CreateRenderMap = {
  [key in TopicType]: Ellipse;
};

export default class EllipseRender extends Render {
  type: ALLRenderType = "ellipse";

  createRender = {} as CreateRenderMap;

  constructor(scene: Scene) {
    super();

    topics.forEach((topic) => {
      this.createRender[topic] = new Ellipse(scene);
      VIEW_WS.on(topic, (data: EllipseUpdateDataMap[typeof topic]) => {
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
