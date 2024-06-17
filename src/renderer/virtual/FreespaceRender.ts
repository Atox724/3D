import type { Scene } from "three";

import { VIRTUAL_RENDER_MAP, VIRTUAL_RENDER_ORDER } from "@/constants";
import { Freespace, type FreespaceUpdateData } from "@/renderer/public";
import { VIEW_WS } from "@/utils/websocket";

import Render from "../render";

const topic = VIRTUAL_RENDER_MAP.freespace;
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

/** 车道 */
export default class FreespaceRender extends Render {
  topic: readonly TopicType[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene, renderOrder = VIRTUAL_RENDER_ORDER.FREESPACE) {
    super();

    this.createRender = {
      localmap_lane_lane: new Freespace(scene, renderOrder),
      // 旧接口
      "hdmap Free Space": new Freespace(scene, renderOrder)
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
