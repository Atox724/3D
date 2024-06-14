import type { Scene } from "three";

import { Text, type TextUpdateData } from "../public";
import Target from "../target";

const topic = ["localmap_map_line_id", "localmap_map_lane_id"] as const;
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
      localmap_map_line_id: new Text(scene),
      localmap_map_lane_id: new Text(scene)
    };
  }

  update(data: TextData, topic: TopicType) {
    this.createRender[topic].update(data);
  }
}
