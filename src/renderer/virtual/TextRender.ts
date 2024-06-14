import type { Scene } from "three";

import { PERCEPTION_RENDER_TOPIC } from "@/constants";

import { Text, type TextUpdateData } from "../public";
import Target from "../target";

const topic = [
  PERCEPTION_RENDER_TOPIC.LOCALMAP_MAP_LINE_ID,
  PERCEPTION_RENDER_TOPIC.LOCALMAP_MAP_LANE_ID
] as const;
type TopicType = (typeof topic)[number];

type TextData = TextUpdateData;

type CreateRenderType = Text;

type CreateRenderMap = Record<TopicType, CreateRenderType>;

export default class TextRender extends Target {
  topic: readonly string[] = topic;

  createRender: CreateRenderMap;

  constructor(scene: Scene) {
    super(scene);

    this.createRender = {
      [PERCEPTION_RENDER_TOPIC.LOCALMAP_MAP_LINE_ID]: new Text(scene),
      [PERCEPTION_RENDER_TOPIC.LOCALMAP_MAP_LANE_ID]: new Text(scene)
    };
  }

  update(data: TextData, topic: TopicType) {
    this.createRender[topic].update(data);
  }
}
