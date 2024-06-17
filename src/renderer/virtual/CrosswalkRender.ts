import type { Scene } from "three";

import { VIRTUAL_RENDER_MAP, VIRTUAL_RENDER_ORDER } from "@/constants";
import { VIEW_WS } from "@/utils/websocket";

import { Crosswalk, type CrosswalkUpdateData } from "../public";
import Render from "../render";

const topic = VIRTUAL_RENDER_MAP.crosswalk;
type TopicType = (typeof topic)[number];

type CrosswalkUpdateDataMap = {
  [key in TopicType]: {
    topic: TopicType;
    data: CrosswalkUpdateData;
  };
};

type CreateRenderMap = {
  [key in TopicType]: Crosswalk;
};

export default class CrosswalkRender extends Render {
  topic: readonly TopicType[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene, renderOrder = VIRTUAL_RENDER_ORDER.CROSSWALK) {
    super();

    this.createRender = {
      localmap_crosswalk: new Crosswalk(scene, renderOrder)
    };

    let topic: TopicType;
    for (topic in this.createRender) {
      VIEW_WS.on(topic, (data: CrosswalkUpdateDataMap[TopicType]) => {
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
