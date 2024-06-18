import type { Scene } from "three";

import { AUGMENTED_RENDER_MAP } from "@/constants";
import { Freespace, type FreespaceUpdateData } from "@/renderer/public";
import { VIEW_WS } from "@/utils/websocket";

import Render from "../render";

const topics = AUGMENTED_RENDER_MAP.freespace;
type TopicType = (typeof topics)[number];

type FreespaceUpdateDataMap = {
  [key in TopicType]: {
    topic: TopicType;
    data: FreespaceUpdateData;
  };
};

type CreateRenderMap = {
  [key in TopicType]: Freespace;
};

export default class FreespaceRender extends Render {
  createRender = {} as CreateRenderMap;

  constructor(scene: Scene) {
    super();

    topics.forEach((topic) => {
      this.createRender[topic] = new Freespace(scene);
      VIEW_WS.on(topic, (data: FreespaceUpdateDataMap[typeof topic]) => {
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
