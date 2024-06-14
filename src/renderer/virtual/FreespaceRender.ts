import type { Scene } from "three";

import { PERCEPTION_RENDER_TOPIC } from "@/constants";
import { Freespace, type FreespaceUpdateData } from "@/renderer/public";

import Target from "../target";

const topic = [PERCEPTION_RENDER_TOPIC.LOCALMAP_LANE_LANE] as const;
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
      [PERCEPTION_RENDER_TOPIC.LOCALMAP_LANE_LANE]: new Freespace(scene)
    };
  }

  update(data: LaneData, topic: TopicType) {
    this.createRender[topic].update(data);
  }
}
