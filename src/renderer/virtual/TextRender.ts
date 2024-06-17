import type { Scene } from "three";

import { VIRTUAL_RENDER_MAP, VIRTUAL_RENDER_ORDER } from "@/constants";

import { Text, type TextUpdateData } from "../public";
import Target from "../target";

const topic = VIRTUAL_RENDER_MAP.text_sprite;
type TopicType = (typeof topic)[number];

type TextUpdateDataMap = {
  [key in TopicType]: TextUpdateData;
};

type CreateRenderMap = {
  [key in TopicType]: Text;
};

export default class TextRender extends Target {
  topic: readonly TopicType[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene, renderOrder = VIRTUAL_RENDER_ORDER.TEXT) {
    super(scene, renderOrder);

    this.createRender = {
      localmap_map_line_id: new Text(scene, renderOrder),
      localmap_map_lane_id: new Text(scene, renderOrder)
    };
  }

  update<T extends TopicType>(data: TextUpdateDataMap[T], topic: T) {
    this.createRender[topic].update(data);
  }
}
