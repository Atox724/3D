import type { Scene } from "three";

import { Freespace, type FreespaceUpdateData } from "@/renderer/public";

import Target from "../target";

const topic = ["localmap_lane_lane"] as const;
type TopicType = (typeof topic)[number];

type LaneData = FreespaceUpdateData;

type CreateRenderType = Freespace;

type CreateRenderMap = Record<TopicType, CreateRenderType>;

/** 车道 */
export default class FreespaceRender extends Target {
  topic: readonly string[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene) {
    super(scene);

    this.createRender = {
      localmap_lane_lane: new Freespace(scene)
    };
  }

  update(data: LaneData, topic: TopicType) {
    this.createRender[topic].update(data);
  }
}
