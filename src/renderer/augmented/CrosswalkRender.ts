import type { Scene } from "three";

import { PILOTHMI_RENDER_TOPIC } from "@/constants";

import { Crosswalk, type CrosswalkUpdateData } from "../public";
import Target from "../target";

const topic = [
  PILOTHMI_RENDER_TOPIC.PILOTHMI_CROSS_WALK,
  PILOTHMI_RENDER_TOPIC.PILOTHMI_CROSS_WALK_LOCAL
] as const;
type TopicType = (typeof topic)[number];

type CrosswalkData = CrosswalkUpdateData;

type CreateRenderType = Crosswalk;

type CreateRenderMap = Record<TopicType, CreateRenderType>;

export default class CrosswalkRender extends Target {
  topic: readonly TopicType[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene) {
    super(scene);

    this.createRender = {
      [PILOTHMI_RENDER_TOPIC.PILOTHMI_CROSS_WALK]: new Crosswalk(scene),
      [PILOTHMI_RENDER_TOPIC.PILOTHMI_CROSS_WALK_LOCAL]: new Crosswalk(scene)
    };
  }

  update(data: CrosswalkData, topic: TopicType) {
    this.createRender[topic].update(data);
  }
}
