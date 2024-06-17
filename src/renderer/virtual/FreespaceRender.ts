import type { Scene } from "three";

import { VIRTUAL_RENDER_MAP, VIRTUAL_RENDER_ORDER } from "@/constants";
import { Freespace, type FreespaceUpdateData } from "@/renderer/public";

import Target from "../target";

const topic = VIRTUAL_RENDER_MAP.freespace;
type TopicType = (typeof topic)[number];

type FreespaceUpdateDataMap = {
  [key in TopicType]: FreespaceUpdateData;
};

type CreateRenderMap = {
  [key in TopicType]: Freespace;
};

/** 车道 */
export default class FreespaceRender extends Target {
  topic: readonly TopicType[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene, renderOrder = VIRTUAL_RENDER_ORDER.FREESPACE) {
    super(scene, renderOrder);

    this.createRender = {
      localmap_lane_lane: new Freespace(scene, renderOrder)
    };
  }

  update<T extends TopicType>(data: FreespaceUpdateDataMap[T], topic: T) {
    this.createRender[topic].update(data);
  }
}
