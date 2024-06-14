import type { Scene } from "three";

import { PILOTHMI_RENDER_TOPIC } from "@/constants";
import { Freespace, type FreespaceUpdateData } from "@/renderer/public";

import Target from "../target";

const topic = [PILOTHMI_RENDER_TOPIC.PILOTHMI_LANE_LINE] as const;
type TopicType = (typeof topic)[number];

type LaneData = FreespaceUpdateData;

type CreateRenderType = Freespace;

type CreateRenderMap = Record<TopicType, CreateRenderType>;

export default class FreespaceRender extends Target {
  topic: readonly TopicType[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene) {
    super(scene);

    this.createRender = {
      [PILOTHMI_RENDER_TOPIC.PILOTHMI_LANE_LINE]: new Freespace(scene)
    };
  }

  update(data: LaneData, topic: TopicType) {
    this.createRender[topic].update(data);
  }
}
