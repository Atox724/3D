import type { Scene } from "three";

import { AUGMENTED_RENDER_MAP } from "@/constants";
import { Freespace, type FreespaceUpdateData } from "@/renderer/public";

import Target from "../target";

const topic = AUGMENTED_RENDER_MAP.freespace;
type TopicType = (typeof topic)[number];

type FreespaceUpdateDataMap = {
  [key in TopicType]: FreespaceUpdateData;
};

type CreateRenderMap = {
  [key in TopicType]: Freespace;
};

export default class FreespaceRender extends Target {
  topic: readonly TopicType[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene) {
    super(scene);

    this.createRender = {
      pilothmi_lane_line: new Freespace(scene)
    };
  }

  update<T extends TopicType>(data: FreespaceUpdateDataMap[T], topic: T) {
    this.createRender[topic].update(data);
  }
}
