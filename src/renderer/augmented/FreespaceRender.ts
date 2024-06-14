import type { Scene } from "three";

import { Freespace, type FreespaceUpdateData } from "@/renderer/public";

import Target from "../target";

const topic = ["pilothmi_lane_line"] as const;
type TopicType = (typeof topic)[number];

type LaneData = FreespaceUpdateData;

type CreateRenderType = Freespace;

type CreateRenderMap = Record<TopicType, CreateRenderType>;

export default class FreespaceRender extends Target {
  topic: readonly string[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene) {
    super(scene);

    this.createRender = {
      pilothmi_lane_line: new Freespace(scene)
    };
  }

  update(data: LaneData, topic: TopicType) {
    this.createRender[topic].update(data);
  }
}
