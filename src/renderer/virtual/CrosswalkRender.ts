import type { Scene } from "three";

import { VIRTUAL_RENDER_MAP } from "@/constants";

import { Crosswalk, type CrosswalkUpdateData } from "../public";
import Target from "../target";

const topic = VIRTUAL_RENDER_MAP.crosswalk;
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

  constructor(scene: Scene) {
    super(scene);

    this.createRender = {
      localmap_crosswalk: new Crosswalk(scene)
    };
  }

  update<T extends TopicType>(data: CrosswalkUpdateDataMap[T], topic: T) {
    this.createRender[topic].update(data);
  }
}
