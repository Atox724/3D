import type { Scene } from "three";

import { VIRTUAL_RENDER_MAP } from "@/constants";
import { VIEW_WS } from "@/utils/websocket";

import { Text, type TextUpdateData } from "../public";
import Render from "../render";

const topics = VIRTUAL_RENDER_MAP.text_sprite;
type TopicType = (typeof topics)[number];

type TextUpdateDataMap = {
  [key in TopicType]: {
    topic: TopicType;
    data: TextUpdateData;
  };
};

type CreateRenderMap = {
  [key in TopicType]: Text;
};

export default class TextRender extends Render {
  createRender = {} as CreateRenderMap;

  constructor(scene: Scene) {
    super();

    topics.forEach((topic) => {
      this.createRender[topic] = new Text(scene);
      VIEW_WS.on(topic, (data: TextUpdateDataMap[typeof topic]) => {
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
