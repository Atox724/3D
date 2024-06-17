import type { Scene } from "three";

import { AUGMENTED_RENDER_MAP, AUGMENTED_RENDER_ORDER } from "@/constants";
import { Freespace, type FreespaceUpdateData } from "@/renderer/public";
import { VIEW_WS } from "@/utils/websocket";

import Render from "../render";

const topic = AUGMENTED_RENDER_MAP.freespace;
type TopicType = (typeof topic)[number];

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
  topic: readonly TopicType[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene, renderOrder = AUGMENTED_RENDER_ORDER.FREESPACE) {
    super();

    this.createRender = {
      pilothmi_lane_line: new Freespace(scene, renderOrder)
    };

    let topic: TopicType;
    for (topic in this.createRender) {
      VIEW_WS.on(topic, (data: FreespaceUpdateDataMap[TopicType]) => {
        this.createRender[data.topic].update(data.data);
      });
    }
  }

  dispose(): void {
    for (const topic in this.createRender) {
      VIEW_WS.off(topic);
    }
    super.dispose();
  }
}
