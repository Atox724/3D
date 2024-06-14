import type { Scene } from "three";

import { PERCEPTION_RENDER_TOPIC } from "@/constants";

import { Crosswalk, type CrosswalkUpdateData } from "../public";
import Target from "../target";

const topic = [PERCEPTION_RENDER_TOPIC.LOCALMAP_CROSSWALK] as const;
type TopicType = (typeof topic)[number];

type CrosswalkData = CrosswalkUpdateData;

type CreateRenderType = Crosswalk;

type CreateRenderMap = Record<TopicType, CreateRenderType>;

export default class CrosswalkRender extends Target {
  topic: readonly string[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene) {
    super(scene);

    this.createRender = {
      [PERCEPTION_RENDER_TOPIC.LOCALMAP_CROSSWALK]: new Crosswalk(scene)
    };
  }

  update(data: CrosswalkData, topic: TopicType) {
    this.createRender[topic].update(data);
  }
}
