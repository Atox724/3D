import type { Scene } from "three";

import { VIRTUAL_RENDER_MAP, VIRTUAL_RENDER_ORDER } from "@/constants";
import { VIEW_WS } from "@/utils/websocket";

import { Text, type TextUpdateData } from "../public";
import Render from "../render";

const topic = VIRTUAL_RENDER_MAP.text_sprite;
type TopicType = (typeof topic)[number];

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
  topic: readonly TopicType[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene, renderOrder = VIRTUAL_RENDER_ORDER.TEXT) {
    super();

    this.createRender = {
      localmap_map_line_id: new Text(scene, renderOrder),
      localmap_map_lane_id: new Text(scene, renderOrder)
    };

    let topic: TopicType;
    for (topic in this.createRender) {
      VIEW_WS.on(topic, (data: TextUpdateDataMap[TopicType]) => {
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
