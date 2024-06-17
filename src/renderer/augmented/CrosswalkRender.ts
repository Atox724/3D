import type { Scene } from "three";

import { AUGMENTED_RENDER_MAP, AUGMENTED_RENDER_ORDER } from "@/constants";

import { Crosswalk, type CrosswalkUpdateData } from "../public";
import Target from "../target";

const topic = AUGMENTED_RENDER_MAP.crosswalk;
type TopicType = (typeof topic)[number];

type CrosswalkUpdateDataMap = {
  [key in TopicType]: CrosswalkUpdateData;
};

type CreateRenderMap = {
  [key in TopicType]: Crosswalk;
};

export default class CrosswalkRender extends Target {
  topic: readonly TopicType[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene, renderOrder = AUGMENTED_RENDER_ORDER.CROSSWALK) {
    super(scene, renderOrder);

    this.createRender = {
      pilothmi_cross_walk_local: new Crosswalk(scene, renderOrder)
    };
  }

  update<T extends TopicType>(data: CrosswalkUpdateDataMap[T], topic: T) {
    this.createRender[topic].update(data);
  }
}
