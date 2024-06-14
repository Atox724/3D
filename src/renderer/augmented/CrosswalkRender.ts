import type { Scene } from "three";

import { Crosswalk, type CrosswalkUpdateData } from "../public";
import Target from "../target";

const topic = ["pilothmi_cross_walk_local", "pilothmi_cross_walk"] as const;
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
      pilothmi_cross_walk_local: new Crosswalk(scene),
      pilothmi_cross_walk: new Crosswalk(scene)
    };
  }

  update(data: CrosswalkData, topic: TopicType) {
    this.createRender[topic].update(data);
  }
}
